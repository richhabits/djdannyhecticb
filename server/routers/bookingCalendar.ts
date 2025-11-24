import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { CacheManager, CACHE_PREFIXES, CACHE_TTL, CacheInvalidator, DistributedLock } from '../_core/cache';
import { createPaymentIntent, createCheckoutSession, DJ_SERVICES } from '../_core/stripe';
import { db } from '../db';
import { bookings, users } from '../../drizzle/schema';
import { eq, and, gte, lte, between, sql } from 'drizzle-orm';

/**
 * Enterprise-level Booking Calendar Router with availability management
 */

// Validation schemas
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)');

const availabilityQuerySchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  serviceType: z.enum(['wedding', 'club_night', 'private_party', 'corporate_event', 'radio_show', 'live_stream']).optional(),
});

const bookingSlotSchema = z.object({
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  servicePackageId: z.number().optional(),
});

const createBookingSchema = z.object({
  eventName: z.string().min(3).max(255),
  eventDate: z.string(),
  eventLocation: z.string().min(3).max(255),
  eventType: z.enum(['wedding', 'club', 'private', 'corporate', 'radio', 'streaming']),
  guestCount: z.number().min(1).max(1000).optional(),
  budget: z.string().optional(),
  description: z.string().max(2000).optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  slots: z.array(bookingSlotSchema),
  addOns: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number().default(1),
  })).optional(),
  paymentMethod: z.enum(['stripe', 'bank_transfer', 'cash']).default('stripe'),
  musicGenres: z.array(z.string()).optional(),
  specialRequests: z.string().optional(),
});

export const bookingCalendarRouter = router({
  /**
   * Get availability for a date range
   */
  getAvailability: publicProcedure
    .input(availabilityQuerySchema)
    .query(async ({ input }) => {
      const cacheKey = `${CACHE_PREFIXES.AVAILABILITY}${input.startDate}_${input.endDate}_${input.serviceType || 'all'}`;
      
      // Try to get from cache first
      const cached = await CacheManager.get<any>(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        // Query database for availability
        const query = `
          SELECT 
            date,
            startTime,
            endTime,
            isAvailable,
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM booking_slots bs 
                WHERE bs.date = da.date 
                  AND bs.status = 'confirmed'
                  AND TIME(bs.startTime) < TIME(da.endTime)
                  AND TIME(bs.endTime) > TIME(da.startTime)
              ) THEN false
              WHEN EXISTS (
                SELECT 1 FROM blocked_dates bd
                WHERE da.date BETWEEN bd.startDate AND bd.endDate
              ) THEN false
              ELSE da.isAvailable
            END as actualAvailability
          FROM dj_availability da
          WHERE da.date BETWEEN ? AND ?
          ORDER BY da.date, da.startTime
        `;

        const availability = await db.execute(sql.raw(query), [input.startDate, input.endDate]);
        
        // Get confirmed bookings for the date range
        const bookedSlots = await db.execute(sql`
          SELECT 
            bs.date,
            bs.startTime,
            bs.endTime,
            b.eventName,
            b.eventType
          FROM booking_slots bs
          JOIN bookings b ON bs.bookingId = b.id
          WHERE bs.date BETWEEN ${input.startDate} AND ${input.endDate}
            AND bs.status = 'confirmed'
          ORDER BY bs.date, bs.startTime
        `);

        // Get blocked dates
        const blockedDates = await db.execute(sql`
          SELECT startDate, endDate, reason
          FROM blocked_dates
          WHERE (startDate <= ${input.endDate} AND endDate >= ${input.startDate})
             OR isRecurring = true
        `);

        const result = {
          availability: availability.rows || [],
          bookedSlots: bookedSlots.rows || [],
          blockedDates: blockedDates.rows || [],
          generated: new Date().toISOString(),
        };

        // Cache the result
        await CacheManager.set(cacheKey, result, CACHE_TTL.MEDIUM);

        return result;
      } catch (error) {
        console.error('Error fetching availability:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch availability',
        });
      }
    }),

  /**
   * Check if specific time slot is available
   */
  checkSlotAvailability: publicProcedure
    .input(bookingSlotSchema)
    .query(async ({ input }) => {
      const cacheKey = `${CACHE_PREFIXES.AVAILABILITY}slot_${input.date}_${input.startTime}_${input.endTime}`;
      
      const cached = await CacheManager.get<boolean>(cacheKey);
      if (cached !== null) {
        return { available: cached };
      }

      try {
        // Check for conflicts
        const conflicts = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM booking_slots
          WHERE date = ${input.date}
            AND status = 'confirmed'
            AND (
              (TIME(startTime) < TIME(${input.endTime}) AND TIME(endTime) > TIME(${input.startTime}))
            )
        `);

        const blockedCheck = await db.execute(sql`
          SELECT COUNT(*) as count
          FROM blocked_dates
          WHERE ${input.date} BETWEEN startDate AND endDate
        `);

        const available = 
          (conflicts.rows[0] as any).count === 0 && 
          (blockedCheck.rows[0] as any).count === 0;

        // Cache for a short time
        await CacheManager.set(cacheKey, available, CACHE_TTL.SHORT);

        return { available };
      } catch (error) {
        console.error('Error checking slot availability:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check slot availability',
        });
      }
    }),

  /**
   * Create a new booking with payment processing
   */
  createBooking: protectedProcedure
    .input(createBookingSchema)
    .mutation(async ({ ctx, input }) => {
      // Acquire distributed lock to prevent double booking
      const lockKey = `booking_${input.eventDate}_${input.slots[0].startTime}`;
      const lock = await DistributedLock.acquire(lockKey, 10000);
      
      if (!lock.acquired) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Another booking is being processed for this time slot. Please try again.',
        });
      }

      try {
        // Start transaction
        const booking = await db.transaction(async (tx) => {
          // Double-check availability within transaction
          for (const slot of input.slots) {
            const conflicts = await tx.execute(sql`
              SELECT COUNT(*) as count
              FROM booking_slots
              WHERE date = ${slot.date}
                AND status = 'confirmed'
                AND (
                  (TIME(startTime) < TIME(${slot.endTime}) AND TIME(endTime) > TIME(${slot.startTime}))
                )
            `);

            if ((conflicts.rows[0] as any).count > 0) {
              throw new TRPCError({
                code: 'CONFLICT',
                message: `Time slot ${slot.date} ${slot.startTime}-${slot.endTime} is no longer available`,
              });
            }
          }

          // Create the booking
          const [newBooking] = await tx.insert(bookings).values({
            userId: ctx.user!.id,
            eventName: input.eventName,
            eventDate: new Date(input.eventDate),
            eventLocation: input.eventLocation,
            eventType: input.eventType,
            guestCount: input.guestCount,
            budget: input.budget,
            description: input.description,
            contactEmail: input.contactEmail,
            contactPhone: input.contactPhone,
            status: 'pending',
          });

          const bookingId = (newBooking as any).insertId;

          // Create booking slots
          for (const slot of input.slots) {
            await tx.execute(sql`
              INSERT INTO booking_slots (bookingId, date, startTime, endTime, status)
              VALUES (${bookingId}, ${slot.date}, ${slot.startTime}, ${slot.endTime}, 'pending')
            `);
          }

          // Add any add-ons
          if (input.addOns && input.addOns.length > 0) {
            for (const addon of input.addOns) {
              await tx.execute(sql`
                INSERT INTO booking_addons (bookingId, name, price, quantity)
                VALUES (${bookingId}, ${addon.name}, ${addon.price}, ${addon.quantity})
              `);
            }
          }

          // Calculate total price
          let totalAmount = 0;
          
          // Base service price
          const serviceKey = input.eventType.toUpperCase().replace(' ', '_');
          const service = DJ_SERVICES[serviceKey as keyof typeof DJ_SERVICES];
          if (service) {
            totalAmount = service.amount;
          }

          // Add add-on prices
          if (input.addOns) {
            for (const addon of input.addOns) {
              totalAmount += addon.price * addon.quantity * 100; // Convert to cents
            }
          }

          // Create Stripe payment intent if using Stripe
          if (input.paymentMethod === 'stripe' && totalAmount > 0) {
            const paymentIntent = await createPaymentIntent({
              amount: totalAmount,
              currency: 'gbp',
              description: `Booking for ${input.eventName} on ${input.eventDate}`,
              customerEmail: input.contactEmail,
              metadata: {
                bookingId: bookingId.toString(),
                eventType: input.eventType,
                eventDate: input.eventDate,
              },
            });

            // Record payment in database
            await tx.execute(sql`
              INSERT INTO booking_payments (
                bookingId,
                stripePaymentIntentId,
                amount,
                currency,
                status,
                paymentMethod
              ) VALUES (
                ${bookingId},
                ${paymentIntent.paymentIntentId},
                ${totalAmount / 100},
                'GBP',
                'pending',
                'stripe'
              )
            `);

            return {
              booking: { id: bookingId, ...input },
              payment: paymentIntent,
            };
          }

          // For non-Stripe payments
          await tx.execute(sql`
            INSERT INTO booking_payments (
              bookingId,
              amount,
              currency,
              status,
              paymentMethod
            ) VALUES (
              ${bookingId},
              ${totalAmount / 100},
              'GBP',
              'pending',
              ${input.paymentMethod}
            )
          `);

          return {
            booking: { id: bookingId, ...input },
            payment: null,
          };
        });

        // Invalidate availability cache
        await CacheInvalidator.invalidateBookings(input.eventDate);

        // Send confirmation email (async, don't wait)
        sendBookingConfirmationEmail(booking.booking).catch(console.error);

        // Schedule reminders
        scheduleBookingReminders(booking.booking.id).catch(console.error);

        return booking;
      } catch (error) {
        console.error('Booking creation error:', error);
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create booking',
        });
      } finally {
        // Always release the lock
        await DistributedLock.release(lockKey, lock.lockId);
      }
    }),

  /**
   * Get user's bookings
   */
  getUserBookings: protectedProcedure
    .input(z.object({
      status: z.enum(['all', 'pending', 'confirmed', 'completed', 'cancelled']).default('all'),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const cacheKey = `${CACHE_PREFIXES.BOOKING}user_${ctx.user!.id}_${input.status}_${input.limit}_${input.offset}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const conditions = [eq(bookings.userId, ctx.user!.id)];
          
          if (input.status !== 'all') {
            conditions.push(eq(bookings.status, input.status as any));
          }

          const userBookings = await db
            .select()
            .from(bookings)
            .where(and(...conditions))
            .orderBy(sql`eventDate DESC`)
            .limit(input.limit)
            .offset(input.offset);

          // Get payment status for each booking
          const bookingIds = userBookings.map(b => b.id);
          const payments = bookingIds.length > 0 ? await db.execute(sql`
            SELECT bookingId, status as paymentStatus, amount, paidAt
            FROM booking_payments
            WHERE bookingId IN (${sql.join(bookingIds, sql`, `)})
          `) : { rows: [] };

          // Combine booking and payment data
          const bookingsWithPayments = userBookings.map(booking => {
            const payment = payments.rows.find((p: any) => p.bookingId === booking.id) as any;
            return {
              ...booking,
              paymentStatus: payment?.paymentStatus,
              paymentAmount: payment?.amount,
              paidAt: payment?.paidAt,
            };
          });

          return bookingsWithPayments;
        },
        CACHE_TTL.SHORT
      );
    }),

  /**
   * Cancel a booking
   */
  cancelBooking: protectedProcedure
    .input(z.object({
      bookingId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const [booking] = await db
        .select()
        .from(bookings)
        .where(and(
          eq(bookings.id, input.bookingId),
          eq(bookings.userId, ctx.user!.id)
        ));

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      if (booking.status === 'cancelled') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Booking is already cancelled',
        });
      }

      // Update booking status
      await db
        .update(bookings)
        .set({ 
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, input.bookingId));

      // Update slot status
      await db.execute(sql`
        UPDATE booking_slots
        SET status = 'cancelled'
        WHERE bookingId = ${input.bookingId}
      `);

      // Process refund if payment was made
      // This would integrate with Stripe refund API
      
      // Invalidate caches
      await CacheInvalidator.invalidateBookings();
      await CacheInvalidator.invalidateUser(ctx.user!.id.toString());

      return { success: true, message: 'Booking cancelled successfully' };
    }),

  /**
   * Get service packages
   */
  getServicePackages: publicProcedure
    .query(async () => {
      const cacheKey = `${CACHE_PREFIXES.BOOKING}service_packages`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const packages = await db.execute(sql`
            SELECT 
              id,
              name,
              description,
              basePrice,
              currency,
              duration,
              setupTime,
              teardownTime,
              maxGuests,
              includes,
              addOns,
              displayOrder
            FROM service_packages
            WHERE isActive = true
            ORDER BY displayOrder, name
          `);

          return packages.rows;
        },
        CACHE_TTL.DAILY
      );
    }),

  /**
   * Get calendar events for public display
   */
  getPublicCalendarEvents: publicProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number().min(2020).max(2100),
    }))
    .query(async ({ input }) => {
      const startDate = `${input.year}-${String(input.month).padStart(2, '0')}-01`;
      const endDate = new Date(input.year, input.month, 0).toISOString().split('T')[0];
      
      const cacheKey = `${CACHE_PREFIXES.BOOKING}calendar_${input.year}_${input.month}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const events = await db.execute(sql`
            SELECT 
              id,
              title,
              description,
              eventType,
              DATE(startDateTime) as date,
              TIME(startDateTime) as startTime,
              TIME(endDateTime) as endTime,
              location,
              color
            FROM calendar_events
            WHERE isPublic = true
              AND DATE(startDateTime) BETWEEN ${startDate} AND ${endDate}
            ORDER BY startDateTime
          `);

          return events.rows;
        },
        CACHE_TTL.LONG
      );
    }),
});

// Helper functions
async function sendBookingConfirmationEmail(booking: any) {
  // Implementation would use SendGrid or similar service
  console.log('Sending confirmation email for booking:', booking.id);
}

async function scheduleBookingReminders(bookingId: number) {
  // Schedule reminders at 1 week, 1 day, and 1 hour before event
  console.log('Scheduling reminders for booking:', bookingId);
}
/**
 * UK Events Router
 * API endpoints for the automated UK events discovery system
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from './_core/trpc';
import { getDb } from './db';
import {
    ukEvents,
    userEventSubmissions,
    promoterProfiles,
    eventRecommendations,
    InsertUserEventSubmission,
    InsertPromoterProfile,
    InsertEventRecommendation
} from '../drizzle/schema';
import { eq, and, gt, desc, asc, sql, like, or } from 'drizzle-orm';
import * as ukEventsService from './_core/ukEventsService';

export const ukEventsRouter = router({
    /**
     * Public: Get upcoming UK events with filters
     */
    list: publicProcedure
        .input(z.object({
            category: z.enum(['music', 'festival', 'boxing', 'sports', 'comedy', 'theatre', 'clubbing', 'other']).optional(),
            city: z.string().optional(),
            genre: z.string().optional(),
            featured: z.boolean().optional(),
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
        }).optional())
        .query(async ({ input }) => {
            return await ukEventsService.getUKEvents({
                category: input?.category,
                city: input?.city,
                genre: input?.genre,
                featured: input?.featured,
                limit: input?.limit || 20,
                offset: input?.offset || 0,
            });
        }),

    /**
     * Public: Get featured events for homepage
     */
    featured: publicProcedure
        .input(z.object({ limit: z.number().min(1).max(12).default(6) }).optional())
        .query(async ({ input }) => {
            return await ukEventsService.getFeaturedUKEvents(input?.limit || 6);
        }),

    /**
     * Public: Get single event by ID
     */
    byId: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
            return await ukEventsService.getUKEventById(input.id);
        }),

    /**
     * Public: Search events
     */
    search: publicProcedure
        .input(z.object({
            query: z.string().min(1).max(100),
            category: z.enum(['music', 'festival', 'boxing', 'sports', 'comedy', 'theatre', 'clubbing', 'other']).optional(),
            city: z.string().optional(),
            limit: z.number().min(1).max(50).default(20),
        }))
        .query(async ({ input }) => {
            return await ukEventsService.searchUKEvents(input.query, {
                category: input.category,
                city: input.city,
                limit: input.limit,
            });
        }),

    /**
     * Public: Get list of cities with events
     */
    cities: publicProcedure.query(async () => {
        return await ukEventsService.getEventCities();
    }),

    /**
     * Public: Get categories with event counts
     */
    categories: publicProcedure.query(async () => {
        return await ukEventsService.getEventCategories();
    }),

    /**
     * Public: Submit an event for approval
     */
    submit: publicProcedure
        .input(z.object({
            // Submitter info
            submitterName: z.string().min(1).max(255),
            submitterEmail: z.string().email().max(255),
            submitterPhone: z.string().max(20).optional(),
            isPromoter: z.boolean().default(false),

            // Event details
            title: z.string().min(1).max(500),
            description: z.string().min(10).max(5000),
            category: z.enum(['music', 'festival', 'boxing', 'sports', 'comedy', 'theatre', 'clubbing', 'other']),
            subcategory: z.string().max(100).optional(),
            genre: z.string().max(100).optional(),

            // Location
            venueName: z.string().min(1).max(255),
            venueAddress: z.string().max(500).optional(),
            city: z.string().min(1).max(100),
            postcode: z.string().max(20).optional(),

            // Timing
            eventDate: z.string(), // ISO date string
            eventEndDate: z.string().optional(),
            doorsTime: z.string().max(10).optional(),

            // Media & Tickets
            imageUrl: z.string().url().max(512).optional(),
            ticketUrl: z.string().url().max(512).optional(),
            priceMin: z.string().max(50).optional(),
            priceMax: z.string().max(50).optional(),

            // Additional
            artists: z.string().max(1000).optional(),
            ageRestriction: z.string().max(50).optional(),
            additionalNotes: z.string().max(2000).optional(),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            const submission: InsertUserEventSubmission = {
                ...input,
                eventDate: new Date(input.eventDate),
                eventEndDate: input.eventEndDate ? new Date(input.eventEndDate) : null,
                status: 'pending',
            };

            const result = await db.insert(userEventSubmissions).values(submission);
            const insertedId = result[0].insertId;

            return {
                success: true,
                id: insertedId,
                message: 'Event submitted successfully! It will be reviewed and appear once approved.'
            };
        }),

    /**
     * Public: Recommend an event
     */
    recommend: publicProcedure
        .input(z.object({
            eventId: z.number(),
            recommenderName: z.string().max(255).optional(),
            recommenderEmail: z.string().email().max(255).optional(),
            reason: z.string().min(10).max(1000),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            const recommendation: InsertEventRecommendation = {
                eventId: input.eventId,
                recommenderName: input.recommenderName || null,
                recommenderEmail: input.recommenderEmail || null,
                reason: input.reason,
                upvotes: 0,
            };

            await db.insert(eventRecommendations).values(recommendation);

            return { success: true, message: 'Thanks for recommending this event!' };
        }),

    /**
     * Public: Register as a promoter
     */
    registerPromoter: publicProcedure
        .input(z.object({
            name: z.string().min(1).max(255),
            companyName: z.string().max(255).optional(),
            email: z.string().email().max(255),
            phone: z.string().max(20).optional(),
            website: z.string().url().max(512).optional(),
            instagramHandle: z.string().max(100).optional(),
            twitterHandle: z.string().max(100).optional(),
            facebookUrl: z.string().url().max(512).optional(),
            bio: z.string().max(2000).optional(),
            logoUrl: z.string().url().max(512).optional(),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            // Check if email already registered
            const existing = await db.select()
                .from(promoterProfiles)
                .where(eq(promoterProfiles.email, input.email))
                .limit(1);

            if (existing.length > 0) {
                throw new Error('A promoter with this email already exists');
            }

            const profile: InsertPromoterProfile = {
                name: input.name,
                companyName: input.companyName || null,
                email: input.email,
                phone: input.phone || null,
                website: input.website || null,
                instagramHandle: input.instagramHandle || null,
                twitterHandle: input.twitterHandle || null,
                facebookUrl: input.facebookUrl || null,
                bio: input.bio || null,
                logoUrl: input.logoUrl || null,
                isVerified: false,
                totalEventsSubmitted: 0,
                approvedEventsCount: 0,
            };

            const result = await db.insert(promoterProfiles).values(profile);

            return {
                success: true,
                id: result[0].insertId,
                message: 'Promoter registration submitted! You will be notified once verified.'
            };
        }),

    /**
     * Admin: Trigger manual sync
     */
    adminSync: adminProcedure.mutation(async () => {
        const result = await ukEventsService.syncTicketmasterEvents();
        return result;
    }),

    /**
     * Admin: List pending event submissions
     */
    adminSubmissions: adminProcedure
        .input(z.object({
            status: z.enum(['pending', 'approved', 'rejected', 'needs_info']).optional(),
            limit: z.number().min(1).max(100).default(20),
        }).optional())
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) return [];

            let query = db.select().from(userEventSubmissions);

            if (input?.status) {
                query = query.where(eq(userEventSubmissions.status, input.status)) as any;
            }

            return await query
                .orderBy(desc(userEventSubmissions.createdAt))
                .limit(input?.limit || 20);
        }),

    /**
     * Admin: Approve/reject event submission
     */
    adminReviewSubmission: adminProcedure
        .input(z.object({
            id: z.number(),
            status: z.enum(['approved', 'rejected', 'needs_info']),
            rejectionReason: z.string().max(1000).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            const [submission] = await db.select()
                .from(userEventSubmissions)
                .where(eq(userEventSubmissions.id, input.id))
                .limit(1);

            if (!submission) {
                throw new Error('Submission not found');
            }

            await db.update(userEventSubmissions)
                .set({
                    status: input.status,
                    reviewedBy: ctx.user?.id,
                    reviewedAt: new Date(),
                    rejectionReason: input.rejectionReason || null,
                })
                .where(eq(userEventSubmissions.id, input.id));

            // If approved, add to UK events
            if (input.status === 'approved') {
                await db.insert(ukEvents).values({
                    externalId: `submission-${submission.id}`,
                    source: 'user_submission',
                    title: submission.title,
                    description: submission.description,
                    category: submission.category,
                    subcategory: submission.subcategory,
                    genre: submission.genre,
                    venueName: submission.venueName,
                    venueAddress: submission.venueAddress,
                    city: submission.city,
                    postcode: submission.postcode,
                    eventDate: submission.eventDate,
                    eventEndDate: submission.eventEndDate,
                    doorsTime: submission.doorsTime,
                    imageUrl: submission.imageUrl,
                    ticketUrl: submission.ticketUrl,
                    priceMin: submission.priceMin,
                    priceMax: submission.priceMax,
                    artists: submission.artists,
                    ageRestriction: submission.ageRestriction,
                    isFeatured: false,
                    isVerified: true,
                    viewCount: 0,
                });

                // Update promoter stats if applicable
                if (submission.promoterId) {
                    await db.update(promoterProfiles)
                        .set({
                            approvedEventsCount: sql`${promoterProfiles.approvedEventsCount} + 1`,
                        })
                        .where(eq(promoterProfiles.id, submission.promoterId));
                }
            }

            return { success: true };
        }),

    /**
     * Admin: List promoters
     */
    adminPromoters: adminProcedure
        .input(z.object({
            verified: z.boolean().optional(),
            limit: z.number().min(1).max(100).default(20),
        }).optional())
        .query(async ({ input }) => {
            const db = await getDb();
            if (!db) return [];

            let query = db.select().from(promoterProfiles);

            if (input?.verified !== undefined) {
                query = query.where(eq(promoterProfiles.isVerified, input.verified)) as any;
            }

            return await query
                .orderBy(desc(promoterProfiles.createdAt))
                .limit(input?.limit || 20);
        }),

    /**
     * Admin: Verify promoter
     */
    adminVerifyPromoter: adminProcedure
        .input(z.object({
            id: z.number(),
            verified: z.boolean(),
            notes: z.string().max(1000).optional(),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            await db.update(promoterProfiles)
                .set({
                    isVerified: input.verified,
                    verifiedAt: input.verified ? new Date() : null,
                    verificationNotes: input.notes || null,
                })
                .where(eq(promoterProfiles.id, input.id));

            return { success: true };
        }),

    /**
     * Admin: Feature/unfeature an event
     */
    adminFeature: adminProcedure
        .input(z.object({
            id: z.number(),
            featured: z.boolean(),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            await db.update(ukEvents)
                .set({ isFeatured: input.featured })
                .where(eq(ukEvents.id, input.id));

            return { success: true };
        }),
});

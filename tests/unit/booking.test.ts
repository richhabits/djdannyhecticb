import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../../server/routers';
import { bookingCalendarRouter } from '../../server/routers/bookingCalendar';
import { CacheManager, DistributedLock } from '../../server/_core/cache';
import { createPaymentIntent } from '../../server/_core/stripe';
import { db } from '../../server/db';

// Mock dependencies
vi.mock('../../server/_core/cache');
vi.mock('../../server/_core/stripe');
vi.mock('../../server/db');

describe('Booking Calendar Router', () => {
  const mockUser = {
    id: 1,
    openId: 'test-open-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
  };

  const mockContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  const createCaller = createCallerFactory(bookingCalendarRouter);
  const caller = createCaller(mockContext);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailability', () => {
    it('should return availability for date range', async () => {
      const mockAvailability = {
        availability: [
          {
            date: '2024-01-15',
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true,
            actualAvailability: true,
          },
        ],
        bookedSlots: [],
        blockedDates: [],
        generated: new Date().toISOString(),
      };

      vi.mocked(CacheManager.get).mockResolvedValue(null);
      vi.mocked(CacheManager.set).mockResolvedValue(true);
      vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any);

      const result = await caller.getAvailability({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toBeDefined();
      expect(CacheManager.get).toHaveBeenCalled();
      expect(CacheManager.set).toHaveBeenCalled();
    });

    it('should return cached availability if available', async () => {
      const cachedData = {
        availability: [],
        bookedSlots: [],
        blockedDates: [],
        generated: new Date().toISOString(),
      };

      vi.mocked(CacheManager.get).mockResolvedValue(cachedData);

      const result = await caller.getAvailability({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toEqual(cachedData);
      expect(db.execute).not.toHaveBeenCalled();
    });
  });

  describe('checkSlotAvailability', () => {
    it('should return true for available slot', async () => {
      vi.mocked(CacheManager.get).mockResolvedValue(null);
      vi.mocked(db.execute)
        .mockResolvedValueOnce({ rows: [{ count: 0 }] } as any) // No conflicts
        .mockResolvedValueOnce({ rows: [{ count: 0 }] } as any); // Not blocked

      const result = await caller.checkSlotAvailability({
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '12:00',
      });

      expect(result.available).toBe(true);
    });

    it('should return false for conflicting slot', async () => {
      vi.mocked(CacheManager.get).mockResolvedValue(null);
      vi.mocked(db.execute)
        .mockResolvedValueOnce({ rows: [{ count: 1 }] } as any) // Has conflicts
        .mockResolvedValueOnce({ rows: [{ count: 0 }] } as any); // Not blocked

      const result = await caller.checkSlotAvailability({
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '12:00',
      });

      expect(result.available).toBe(false);
    });

    it('should return false for blocked date', async () => {
      vi.mocked(CacheManager.get).mockResolvedValue(null);
      vi.mocked(db.execute)
        .mockResolvedValueOnce({ rows: [{ count: 0 }] } as any) // No conflicts
        .mockResolvedValueOnce({ rows: [{ count: 1 }] } as any); // Is blocked

      const result = await caller.checkSlotAvailability({
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '12:00',
      });

      expect(result.available).toBe(false);
    });
  });

  describe('createBooking', () => {
    const mockBookingData = {
      eventName: 'Test Event',
      eventDate: '2024-01-15',
      eventLocation: 'Test Location',
      eventType: 'private' as const,
      contactEmail: 'test@example.com',
      slots: [{
        date: '2024-01-15',
        startTime: '10:00',
        endTime: '12:00',
        available: true,
      }],
      paymentMethod: 'stripe' as const,
    };

    it('should create booking with Stripe payment', async () => {
      vi.mocked(DistributedLock.acquire).mockResolvedValue({
        acquired: true,
        lockId: 'test-lock',
      });
      vi.mocked(DistributedLock.release).mockResolvedValue(true);

      // Mock database transaction
      const mockTx = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 0 }] }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue([{ insertId: 123 }]),
        }),
      };
      vi.mocked(db.transaction).mockImplementation(async (fn) => fn(mockTx as any));

      // Mock Stripe payment
      vi.mocked(createPaymentIntent).mockResolvedValue({
        success: true,
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      });

      const result = await caller.createBooking(mockBookingData);

      expect(result).toBeDefined();
      expect(result.booking.id).toBe(123);
      expect(result.payment?.clientSecret).toBe('pi_test_secret');
      expect(DistributedLock.acquire).toHaveBeenCalled();
      expect(DistributedLock.release).toHaveBeenCalled();
    });

    it('should handle lock acquisition failure', async () => {
      vi.mocked(DistributedLock.acquire).mockResolvedValue({
        acquired: false,
        lockId: '',
      });

      await expect(caller.createBooking(mockBookingData)).rejects.toThrow(
        'Another booking is being processed for this time slot'
      );
    });

    it('should handle slot conflict during transaction', async () => {
      vi.mocked(DistributedLock.acquire).mockResolvedValue({
        acquired: true,
        lockId: 'test-lock',
      });
      vi.mocked(DistributedLock.release).mockResolvedValue(true);

      // Mock database transaction with conflict
      const mockTx = {
        execute: vi.fn().mockResolvedValue({ rows: [{ count: 1 }] }), // Conflict exists
      };
      vi.mocked(db.transaction).mockImplementation(async (fn) => fn(mockTx as any));

      await expect(caller.createBooking(mockBookingData)).rejects.toThrow(
        'Time slot'
      );
    });
  });

  describe('getUserBookings', () => {
    it('should return user bookings', async () => {
      const mockBookings = [
        {
          id: 1,
          eventName: 'Test Event 1',
          eventDate: new Date('2024-01-15'),
          status: 'confirmed',
        },
        {
          id: 2,
          eventName: 'Test Event 2',
          eventDate: new Date('2024-02-01'),
          status: 'pending',
        },
      ];

      vi.mocked(CacheManager.getOrSet).mockImplementation(async (key, fetcher) => {
        return fetcher();
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue(mockBookings),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any);

      const result = await caller.getUserBookings({
        status: 'all',
        limit: 20,
        offset: 0,
      });

      expect(result).toHaveLength(2);
      expect(result[0].eventName).toBe('Test Event 1');
    });

    it('should filter bookings by status', async () => {
      vi.mocked(CacheManager.getOrSet).mockImplementation(async (key, fetcher) => {
        return fetcher();
      });

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as any);

      vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any);

      await caller.getUserBookings({
        status: 'confirmed',
        limit: 20,
        offset: 0,
      });

      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const mockBooking = {
        id: 1,
        userId: 1,
        eventName: 'Test Event',
        status: 'confirmed',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockBooking]),
        }),
      } as any);

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      } as any);

      vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any);

      const result = await caller.cancelBooking({
        bookingId: 1,
        reason: 'Changed plans',
      });

      expect(result.success).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it('should throw error for non-existent booking', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      await expect(caller.cancelBooking({
        bookingId: 999,
      })).rejects.toThrow('Booking not found');
    });

    it('should throw error for already cancelled booking', async () => {
      const mockBooking = {
        id: 1,
        userId: 1,
        eventName: 'Test Event',
        status: 'cancelled',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockBooking]),
        }),
      } as any);

      await expect(caller.cancelBooking({
        bookingId: 1,
      })).rejects.toThrow('Booking is already cancelled');
    });
  });

  describe('getServicePackages', () => {
    it('should return service packages', async () => {
      const mockPackages = [
        {
          id: 1,
          name: 'Wedding Premium',
          basePrice: 1500,
          duration: 480,
        },
        {
          id: 2,
          name: 'Club Night',
          basePrice: 500,
          duration: 240,
        },
      ];

      vi.mocked(CacheManager.getOrSet).mockImplementation(async (key, fetcher) => {
        return fetcher();
      });

      vi.mocked(db.execute).mockResolvedValue({ rows: mockPackages } as any);

      const result = await caller.getServicePackages();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Wedding Premium');
    });
  });

  describe('getPublicCalendarEvents', () => {
    it('should return public calendar events for month', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Public DJ Set',
          date: '2024-01-15',
          startTime: '20:00',
          endTime: '23:00',
          eventType: 'public_event',
        },
      ];

      vi.mocked(CacheManager.getOrSet).mockImplementation(async (key, fetcher) => {
        return fetcher();
      });

      vi.mocked(db.execute).mockResolvedValue({ rows: mockEvents } as any);

      const result = await caller.getPublicCalendarEvents({
        month: 1,
        year: 2024,
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Public DJ Set');
    });
  });
});
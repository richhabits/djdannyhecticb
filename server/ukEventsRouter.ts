/**
 * UK Events Router
 * API endpoints for the automated UK events discovery system
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from './_core/trpc';
import { getDb } from './db';
import {
    events,
} from '../drizzle/schema';
import { eq, and, gt, desc, asc, sql, like, or } from 'drizzle-orm';
import * as ukEventsService from './_core/ukEventsService';

/**
 * NOTE: ukEvents, userEventSubmissions, promoterProfiles, and eventRecommendations tables
 * have been removed from schema. Functionality has been stubbed out.
 * InsertUserEventSubmission, InsertPromoterProfile, and InsertEventRecommendation types removed.
 */

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
     * STUBBED OUT: userEventSubmissions table has been removed from schema
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
            // STUB: userEventSubmissions table removed
            return {
                success: false,
                id: null,
                message: 'Event submission temporarily unavailable - functionality has been removed from schema.'
            };
        }),

    /**
     * Public: Recommend an event
     * STUBBED OUT: eventRecommendations table has been removed from schema
     */
    recommend: publicProcedure
        .input(z.object({
            eventId: z.number(),
            recommenderName: z.string().max(255).optional(),
            recommenderEmail: z.string().email().max(255).optional(),
            reason: z.string().min(10).max(1000),
        }))
        .mutation(async ({ input }) => {
            // STUB: eventRecommendations table removed
            return { success: false, message: 'Event recommendations temporarily unavailable - functionality has been removed from schema.' };
        }),

    /**
     * Public: Register as a promoter
     * STUBBED OUT: promoterProfiles table has been removed from schema
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
            // STUB: promoterProfiles table removed
            return {
                success: false,
                id: null,
                message: 'Promoter registration temporarily unavailable - functionality has been removed from schema.'
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
     * STUBBED OUT: userEventSubmissions table has been removed from schema
     */
    adminSubmissions: adminProcedure
        .input(z.object({
            status: z.enum(['pending', 'approved', 'rejected', 'needs_info']).optional(),
            limit: z.number().min(1).max(100).default(20),
        }).optional())
        .query(async ({ input }) => {
            // STUB: userEventSubmissions table removed
            return [];
        }),

    /**
     * Admin: Approve/reject event submission
     * STUBBED OUT: userEventSubmissions and promoterProfiles tables have been removed from schema
     */
    adminReviewSubmission: adminProcedure
        .input(z.object({
            id: z.number(),
            status: z.enum(['approved', 'rejected', 'needs_info']),
            rejectionReason: z.string().max(1000).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            // STUB: userEventSubmissions and promoterProfiles tables removed
            throw new Error('Event submission review temporarily unavailable - functionality has been removed from schema.');
        }),

    /**
     * Admin: List promoters
     * STUBBED OUT: promoterProfiles table has been removed from schema
     */
    adminPromoters: adminProcedure
        .input(z.object({
            verified: z.boolean().optional(),
            limit: z.number().min(1).max(100).default(20),
        }).optional())
        .query(async ({ input }) => {
            // STUB: promoterProfiles table removed
            return [];
        }),

    /**
     * Admin: Verify promoter
     * STUBBED OUT: promoterProfiles table has been removed from schema
     */
    adminVerifyPromoter: adminProcedure
        .input(z.object({
            id: z.number(),
            verified: z.boolean(),
            notes: z.string().max(1000).optional(),
        }))
        .mutation(async ({ input }) => {
            // STUB: promoterProfiles table removed
            throw new Error('Promoter verification temporarily unavailable - functionality has been removed from schema.');
        }),

    /**
     * Admin: Feature/unfeature an event
     * Now uses 'events' table instead of 'ukEvents' which has been removed
     */
    adminFeature: adminProcedure
        .input(z.object({
            id: z.number(),
            featured: z.boolean(),
        }))
        .mutation(async ({ input }) => {
            const db = await getDb();
            if (!db) throw new Error('Database not available');

            // Using events table instead of removed ukEvents table
            await db.update(events)
                .set({ isFeatured: input.featured })
                .where(eq(events.id, input.id));

            return { success: true };
        }),
});

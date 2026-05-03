/**
 * UK Events Discovery Service
 * Integrates with Ticketmaster Discovery API and other sources
 * for automated UK event discovery and synchronization
 */

import { getDb } from '../db';
import { ukEvents, eventSyncStatus, InsertUKEvent, UKEvent, EventSyncStatus } from '../../drizzle/schema';
import { eq, and, gt, desc, sql, like, ilike } from 'drizzle-orm';

// Ticketmaster API Configuration
const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY || '';
const TICKETMASTER_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

// UK Country Code
const UK_COUNTRY_CODE = 'GB';

// Category mappings from Ticketmaster to our categories
const CATEGORY_MAP: Record<string, 'music' | 'festival' | 'boxing' | 'sports' | 'comedy' | 'theatre' | 'clubbing' | 'other'> = {
    'Music': 'music',
    'Sports': 'sports',
    'Arts & Theatre': 'theatre',
    'Film': 'other',
    'Miscellaneous': 'other',
};

// Genre mappings for music
const GENRE_KEYWORDS: Record<string, string> = {
    'garage': 'UK Garage',
    'house': 'House',
    'dnb': 'Drum & Bass',
    'drum and bass': 'Drum & Bass',
    'grime': 'Grime',
    'hip hop': 'Hip Hop',
    'r&b': 'R&B',
    'soul': 'Soul',
    'jazz': 'Jazz',
    'rock': 'Rock',
    'pop': 'Pop',
    'electronic': 'Electronic',
    'dance': 'Dance',
    'festival': 'Festival',
    'boxing': 'Boxing',
    'mma': 'MMA',
    'ufc': 'UFC',
    'amapiano': 'Amapiano',
    'afrobeats': 'Afrobeats',
};

interface TicketmasterEvent {
    id: string;
    name: string;
    type: string;
    url?: string;
    images?: Array<{ url: string; width: number; height: number; ratio?: string }>;
    dates?: {
        start?: { localDate?: string; localTime?: string; dateTime?: string };
        end?: { localDate?: string; localTime?: string; dateTime?: string };
        status?: { code?: string };
    };
    priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
    classifications?: Array<{
        segment?: { name?: string };
        genre?: { name?: string };
        subGenre?: { name?: string };
    }>;
    _embedded?: {
        venues?: Array<{
            name?: string;
            address?: { line1?: string };
            city?: { name?: string };
            postalCode?: string;
            location?: { latitude?: string; longitude?: string };
        }>;
        attractions?: Array<{ name?: string }>;
    };
    info?: string;
    pleaseNote?: string;
    ageRestrictions?: { legalAgeEnforced?: boolean };
}

interface TicketmasterResponse {
    _embedded?: {
        events?: TicketmasterEvent[];
    };
    page?: {
        size: number;
        totalElements: number;
        totalPages: number;
        number: number;
    };
}

/**
 * Map Ticketmaster event to our schema
 */
function mapTicketmasterEvent(event: TicketmasterEvent): InsertUKEvent | null {
    try {
        const venue = event._embedded?.venues?.[0];
        const classification = event.classifications?.[0];
        const priceRange = event.priceRanges?.[0];
        const artists = event._embedded?.attractions?.map(a => a.name).filter(Boolean) || [];

        // Get the best image
        const images = event.images || [];
        const bestImage = images.find(img => img.ratio === '16_9' && img.width > 500)
            || images.find(img => img.width > 500)
            || images[0];

        // Determine category
        let category: string = 'other';
        const segmentName = classification?.segment?.name || '';

        if (CATEGORY_MAP[segmentName]) {
            category = CATEGORY_MAP[segmentName];
        }

        // Check for boxing/fighting events
        const eventNameLower = event.name.toLowerCase();
        if (eventNameLower.includes('boxing') || eventNameLower.includes('ufc') || eventNameLower.includes('mma')) {
            category = 'boxing';
        }

        // Check for festivals
        if (eventNameLower.includes('festival') || eventNameLower.includes('fest')) {
            category = 'festival';
        }

        // Determine genre for music events
        let subcategory = classification?.subGenre?.name || null;
        for (const [keyword, mappedGenre] of Object.entries(GENRE_KEYWORDS)) {
            if (eventNameLower.includes(keyword) || classification?.genre?.name?.toLowerCase().includes(keyword)) {
                subcategory = mappedGenre;
                break;
            }
        }

        // Parse event date
        const startDate = event.dates?.start?.dateTime || event.dates?.start?.localDate;
        if (!startDate) return null;

        const eventDate = new Date(startDate);
        if (isNaN(eventDate.getTime())) return null;

        // Parse doors time
        let doorsTime: Date | null = null;
        if (event.dates?.start?.localTime) {
            const [hours, minutes] = event.dates.start.localTime.split(':');
            doorsTime = new Date(eventDate);
            doorsTime.setHours(parseInt(hours, 10));
            doorsTime.setMinutes(parseInt(minutes, 10));
        }

        // Determine ticket status
        let ticketStatus = 'available';
        const statusCode = event.dates?.status?.code?.toLowerCase();
        if (statusCode === 'cancelled') ticketStatus = 'cancelled';
        else if (statusCode === 'postponed') ticketStatus = 'postponed';
        else if (statusCode === 'offsale') ticketStatus = 'sold_out';

        return {
            externalId: event.id,
            source: 'ticketmaster',
            title: event.name,
            description: event.info || event.pleaseNote || undefined,
            category,
            subcategory,
            venue: venue?.name || 'TBA',
            city: venue?.city?.name || 'London',
            latitude: venue?.location?.latitude ? venue.location.latitude : undefined,
            longitude: venue?.location?.longitude ? venue.location.longitude : undefined,
            eventDate,
            doorsTime: doorsTime || undefined,
            imageUrl: bestImage?.url || undefined,
            ticketUrl: event.url || undefined,
            priceMin: priceRange?.min ? priceRange.min.toString() : undefined,
            priceMax: priceRange?.max ? priceRange.max.toString() : undefined,
            currency: priceRange?.currency || 'GBP',
            ticketStatus,
            artists: artists.length > 0 ? JSON.stringify(artists) : undefined,
            ageRestriction: event.ageRestrictions?.legalAgeEnforced ? '18+' : undefined,
            isFeatured: false,
            isSynced: true,
            lastSyncedAt: new Date(),
        };
    } catch (error) {
        console.error('[UKEvents] Failed to map event:', error);
        return null;
    }
}

/**
 * Fetch events from Ticketmaster Discovery API v2
 * Based on official docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */
async function fetchTicketmasterEvents(options: {
    keyword?: string;
    classificationName?: string;
    segmentName?: string;
    city?: string;
    startDateTime?: string;
    endDateTime?: string;
    page?: number;
    size?: number;
}): Promise<TicketmasterResponse | null> {
    if (!TICKETMASTER_API_KEY) {
        console.warn('[UKEvents] No Ticketmaster API key configured. Set TICKETMASTER_API_KEY env variable.');
        return null;
    }

    try {
        const params = new URLSearchParams({
            apikey: TICKETMASTER_API_KEY,
            countryCode: UK_COUNTRY_CODE,
            size: (options.size || 50).toString(),
            page: (options.page || 0).toString(),
            sort: 'date,asc',
            // locale: 'en-gb', // Removed as it filters out events
        });

        // Optional filters
        if (options.keyword) params.set('keyword', options.keyword);
        if (options.classificationName) params.set('classificationName', options.classificationName);
        if (options.segmentName) params.set('segmentName', options.segmentName);
        if (options.city) params.set('city', options.city);

        // Date range - Ticketmaster expects ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ
        if (options.startDateTime) params.set('startDateTime', options.startDateTime);
        if (options.endDateTime) params.set('endDateTime', options.endDateTime);

        const url = `${TICKETMASTER_BASE_URL}/events.json?${params}`;
        console.log(`[UKEvents] Fetching: ${url.replace(TICKETMASTER_API_KEY, '***')}`);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[UKEvents] Ticketmaster API error: ${response.status} - ${errorText}`);
            return null;
        }

        const data = await response.json();

        // Log pagination info
        if (data.page) {
            console.log(`[UKEvents] Page ${data.page.number + 1}/${data.page.totalPages}, Total: ${data.page.totalElements} events`);
        }

        return data;
    } catch (error) {
        console.error('[UKEvents] Failed to fetch from Ticketmaster:', error);
        return null;
    }
}

/**
 * Sync UK events from Ticketmaster
 */
export async function syncTicketmasterEvents(): Promise<{
    success: boolean;
    eventsFound: number;
    eventsAdded: number;
    eventsUpdated: number;
    error?: string;
}> {
    const db = await getDb();
    if (!db) {
        return { success: false, eventsFound: 0, eventsAdded: 0, eventsUpdated: 0, error: 'Database not available' };
    }

    const startTime = Date.now();
    let eventsFound = 0;
    let eventsAdded = 0;
    let eventsUpdated = 0;

    try {
        // Get start and end dates (next 3 months)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        // Format: YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
        const startDateTime = startDate.toISOString().split('.')[0] + 'Z';
        const endDateTime = endDate.toISOString().split('.')[0] + 'Z';

        // Fetch music events
        const categories = ['Music', 'Sports', 'Arts & Theatre'];

        for (const category of categories) {
            const response = await fetchTicketmasterEvents({
                classificationName: category,
                startDateTime,
                endDateTime,
                size: 100,
            });

            if (!response?._embedded?.events) continue;

            for (const tmEvent of response._embedded.events) {
                eventsFound++;

                const mappedEvent = mapTicketmasterEvent(tmEvent);
                if (!mappedEvent) continue;

                // Check if event already exists
                const existing = await db.select()
                    .from(ukEvents)
                    .where(and(
                        eq(ukEvents.externalId, mappedEvent.externalId),
                        eq(ukEvents.source, 'ticketmaster')
                    ))
                    .limit(1);

                if (existing.length > 0) {
                    // Update existing event
                    await db.update(ukEvents)
                        .set({
                            ...mappedEvent,
                            lastSyncedAt: new Date(),
                        })
                        .where(eq(ukEvents.id, existing[0].id));
                    eventsUpdated++;
                } else {
                    // Insert new event
                    await db.insert(ukEvents).values(mappedEvent as InsertUKEvent);
                    eventsAdded++;
                }
            }

            // Rate limit - wait between category fetches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Log sync status
        const syncDurationMs = Date.now() - startTime;
        await db.update(eventSyncStatus)
            .set({
                lastSyncedAt: new Date(),
                lastSuccessfulSyncAt: new Date(),
                syncStatus: 'success',
                eventsProcessed: eventsFound,
                eventsCreated: eventsAdded,
                eventsUpdated: eventsUpdated,
                errorMessage: null,
                syncDurationMs,
                updatedAt: new Date(),
            })
            .where(eq(eventSyncStatus.connector, 'ticketmaster'));

        console.log(`[UKEvents] Ticketmaster sync complete: ${eventsFound} found, ${eventsAdded} added, ${eventsUpdated} updated in ${syncDurationMs}ms`);

        return { success: true, eventsFound, eventsAdded, eventsUpdated };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[UKEvents] Sync failed:', error);

        const syncDurationMs = Date.now() - startTime;
        // Log failed sync
        await db.update(eventSyncStatus)
            .set({
                lastSyncedAt: new Date(),
                syncStatus: 'error',
                errorMessage,
                eventsProcessed: eventsFound,
                eventsCreated: eventsAdded,
                eventsUpdated: eventsUpdated,
                syncDurationMs,
                updatedAt: new Date(),
            })
            .where(eq(eventSyncStatus.connector, 'ticketmaster'));

        return { success: false, eventsFound, eventsAdded, eventsUpdated, error: errorMessage };
    }
}

// Sample events for demonstration when database is unavailable
const SAMPLE_EVENTS: UKEvent[] = [
    {
        id: 1,
        externalId: 'tm-sample-1',
        source: 'ticketmaster',
        title: 'Danny Live @ Ministry of Sound',
        description: 'High-energy UK Garage and House set. Danny delivers an electrifying night of classic UK underground sounds.',
        category: 'music',
        subcategory: 'UK Garage',
        venue: 'Ministry of Sound',
        city: 'London',
        latitude: '51.5017',
        longitude: '-0.1194',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        doorsTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000),
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=600&fit=crop',
        ticketUrl: 'https://www.ministryofsound.com',
        priceMin: '£25',
        priceMax: '£35',
        currency: 'GBP',
        ticketStatus: 'available',
        artists: JSON.stringify(['Danny Hectic B']),
        ageRestriction: '18+',
        isFeatured: true,
        isSynced: true,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    } as UKEvent,
    {
        id: 2,
        externalId: 'tm-sample-2',
        source: 'ticketmaster',
        title: 'Electric Ballroom - Jungle Night',
        description: 'Danny joins top UK DJs for an all-night jungle extravaganza. Fast breaks, high energy, unforgettable vibes.',
        category: 'music',
        subcategory: 'Drum & Bass',
        venue: 'Electric Ballroom',
        city: 'London',
        latitude: '51.5401',
        longitude: '-0.1307',
        eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        doorsTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000),
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=600&fit=crop',
        ticketUrl: 'https://www.electricballroom.co.uk',
        priceMin: '£20',
        priceMax: '£30',
        currency: 'GBP',
        ticketStatus: 'available',
        artists: JSON.stringify(['Danny Hectic B', 'Jungle Collective']),
        ageRestriction: '18+',
        isFeatured: true,
        isSynced: true,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    } as UKEvent,
    {
        id: 3,
        externalId: 'tm-sample-3',
        source: 'ticketmaster',
        title: 'XOYO - Private Event',
        description: 'Exclusive booking. Corporate team-building with Danny on the decks. Custom setlist, full technical equipment.',
        category: 'music',
        subcategory: 'House',
        venue: 'XOYO',
        city: 'London',
        latitude: '51.5189',
        longitude: '-0.0903',
        eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        doorsTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000),
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
        ticketUrl: 'https://www.xoyo.co.uk',
        priceMin: '£2000',
        priceMax: '£3000',
        currency: 'GBP',
        ticketStatus: 'available',
        artists: JSON.stringify(['Danny Hectic B']),
        ageRestriction: null,
        isFeatured: true,
        isSynced: true,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    } as UKEvent,
    {
        id: 4,
        externalId: 'tm-sample-4',
        source: 'ticketmaster',
        title: 'SWG3 Glasgow - Warehouse Vibe',
        description: 'Danny takes over the decks at Glasgow\'s premier warehouse venue. 4-hour set of everything from Grime to House.',
        category: 'music',
        subcategory: 'Grime',
        venue: 'SWG3',
        city: 'Glasgow',
        latitude: '55.8642',
        longitude: '-4.2945',
        eventDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        doorsTime: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000 + 22 * 60 * 60 * 1000),
        imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=600&fit=crop',
        ticketUrl: 'https://www.swg3.com',
        priceMin: '£30',
        priceMax: '£45',
        currency: 'GBP',
        ticketStatus: 'available',
        artists: JSON.stringify(['Danny Hectic B', 'Glasgow Crew']),
        ageRestriction: '18+',
        isFeatured: false,
        isSynced: true,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    } as UKEvent,
];

/**
 * Get upcoming UK events with filters
 */
export async function getUKEvents(options: {
    category?: string;
    city?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
}): Promise<UKEvent[]> {
    const db = await getDb();
    if (!db) {
        console.warn('[UKEvents] Database unavailable in getUKEvents');
        return [];
    }

    try {
        const conditions = [
            gt(ukEvents.eventDate, new Date()),
        ];

        if (options.category) {
            conditions.push(eq(ukEvents.category, options.category));
        }

        if (options.city) {
            conditions.push(ilike(ukEvents.city, `%${options.city}%`));
        }

        if (options.featured) {
            conditions.push(eq(ukEvents.isFeatured, true));
        }

        const offset = options.offset || 0;
        const limit = options.limit || 20;

        return await db.select()
            .from(ukEvents)
            .where(and(...conditions))
            .orderBy(desc(ukEvents.eventDate))
            .offset(offset)
            .limit(limit);
    } catch (error) {
        console.error('[UKEvents] Failed to fetch events:', error);
        return [];
    }
}

/**
 * Get event by ID
 */
export async function getUKEventById(id: number): Promise<UKEvent | null> {
    const db = await getDb();
    if (!db) return null;

    try {
        const results = await db.select()
            .from(ukEvents)
            .where(eq(ukEvents.id, id))
            .limit(1);

        return results[0] || null;
    } catch (error) {
        console.error('[UKEvents] Failed to fetch event by ID:', error);
        return null;
    }
}

/**
 * Get featured events
 */
export async function getFeaturedUKEvents(limit: number = 6): Promise<UKEvent[]> {
    const db = await getDb();
    if (!db) {
        console.warn('[UKEvents] Database unavailable in getFeaturedUKEvents');
        return [];
    }

    try {
        return await db.select()
            .from(ukEvents)
            .where(and(
                eq(ukEvents.isFeatured, true),
                gt(ukEvents.eventDate, new Date())
            ))
            .orderBy(desc(ukEvents.eventDate))
            .limit(limit);
    } catch (error) {
        console.error('[UKEvents] Failed to fetch featured events:', error);
        return [];
    }
}

/**
 * Search UK events
 */
export async function searchUKEvents(query: string, options: {
    category?: string;
    city?: string;
    limit?: number;
}): Promise<UKEvent[]> {
    const db = await getDb();
    if (!db) return [];

    try {
        const conditions = [
            gt(ukEvents.eventDate, new Date()),
        ];

        // Search in title, description, venue, and artists
        if (query) {
            conditions.push(
                sql`(
                    ${ilike(ukEvents.title, `%${query}%`)} OR
                    ${ilike(ukEvents.description, `%${query}%`)} OR
                    ${ilike(ukEvents.venue, `%${query}%`)} OR
                    ${ilike(ukEvents.artists, `%${query}%`)}
                )`
            );
        }

        if (options.category) {
            conditions.push(eq(ukEvents.category, options.category));
        }

        if (options.city) {
            conditions.push(ilike(ukEvents.city, `%${options.city}%`));
        }

        const queryBuilder = db.select()
            .from(ukEvents)
            .where(and(...conditions))
            .orderBy(desc(ukEvents.eventDate));

        if (options.limit) {
            queryBuilder.limit(options.limit);
        }

        return await queryBuilder;
    } catch (error) {
        console.error('[UKEvents] Search failed:', error);
        return [];
    }
}

/**
 * Get unique cities with events
 */
export async function getEventCities(): Promise<string[]> {
    const db = await getDb();
    if (!db) return [];

    try {
        const results = await db.selectDistinct({ city: ukEvents.city })
            .from(ukEvents)
            .where(gt(ukEvents.eventDate, new Date()))
            .orderBy(ukEvents.city);

        return results.map(r => r.city).filter(Boolean) as string[];
    } catch (error) {
        console.error('[UKEvents] Failed to fetch cities:', error);
        return [];
    }
}

/**
 * Get event categories with counts
 */
export async function getEventCategories(): Promise<Array<{ category: string; count: number }>> {
    const db = await getDb();
    if (!db) return [];

    try {
        const results = await db.select({
            category: ukEvents.category,
            count: sql<number>`count(*)`.mapWith(Number),
        })
            .from(ukEvents)
            .where(gt(ukEvents.eventDate, new Date()))
            .groupBy(ukEvents.category)
            .orderBy(desc(sql<number>`count(*)`));

        return results.filter(r => r.category) as Array<{ category: string; count: number }>;
    } catch (error) {
        console.error('[UKEvents] Failed to fetch categories:', error);
        return [];
    }
}

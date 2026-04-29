/**
 * UK Events Discovery Service
 * Integrates with Ticketmaster Discovery API and other sources
 * for automated UK event discovery and synchronization
 */

import { getDb } from '../db';
// Removed: ukEvents, eventSyncStatus, InsertUKEvent, InsertEventSyncStatus (types don't exist in schema)
import { eq, and, gt, desc, sql } from 'drizzle-orm';

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
 * NOTE: Disabled - InsertUKEvent type doesn't exist in schema
 */
function mapTicketmasterEvent(event: TicketmasterEvent): any | null {
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
        let category: 'music' | 'festival' | 'boxing' | 'sports' | 'comedy' | 'theatre' | 'clubbing' | 'other' = 'other';
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
        let genre = classification?.genre?.name || '';
        for (const [keyword, mappedGenre] of Object.entries(GENRE_KEYWORDS)) {
            if (eventNameLower.includes(keyword) || genre.toLowerCase().includes(keyword)) {
                genre = mappedGenre;
                break;
            }
        }

        // Parse event date
        const startDate = event.dates?.start?.dateTime || event.dates?.start?.localDate;
        if (!startDate) return null;

        const eventDate = new Date(startDate);
        if (isNaN(eventDate.getTime())) return null;

        // Determine ticket status
        let ticketStatus: 'available' | 'limited' | 'sold_out' | 'cancelled' | 'postponed' = 'available';
        const statusCode = event.dates?.status?.code?.toLowerCase();
        if (statusCode === 'cancelled') ticketStatus = 'cancelled';
        else if (statusCode === 'postponed') ticketStatus = 'postponed';
        else if (statusCode === 'offsale') ticketStatus = 'sold_out';

        return {
            externalId: event.id,
            source: 'ticketmaster',
            title: event.name,
            description: event.info || event.pleaseNote || null,
            category,
            subcategory: classification?.subGenre?.name || null,
            genre: genre || null,
            venueName: venue?.name || null,
            venueAddress: venue?.address?.line1 || null,
            city: venue?.city?.name || 'London',
            postcode: venue?.postalCode || null,
            latitude: venue?.location?.latitude || null,
            longitude: venue?.location?.longitude || null,
            eventDate,
            eventEndDate: event.dates?.end?.dateTime ? new Date(event.dates.end.dateTime) : null,
            doorsTime: event.dates?.start?.localTime || null,
            imageUrl: bestImage?.url || null,
            thumbnailUrl: images.find(img => img.width < 300)?.url || bestImage?.url || null,
            ticketUrl: event.url || null,
            priceMin: priceRange?.min?.toString() || null,
            priceMax: priceRange?.max?.toString() || null,
            currency: priceRange?.currency || 'GBP',
            ticketStatus,
            artists: artists.length > 0 ? artists : null,
            ageRestriction: event.ageRestrictions?.legalAgeEnforced ? '18+' : null,
            isFeatured: false,
            isVerified: true,
            viewCount: 0,
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
 * NOTE: Disabled - ukEvents and eventSyncStatus tables don't exist in schema
 */
export async function syncTicketmasterEvents(): Promise<{
    success: boolean;
    eventsFound: number;
    eventsAdded: number;
    eventsUpdated: number;
    error?: string;
}> {
    // Disabled: Tables ukEvents and eventSyncStatus don't exist in schema
    return {
        success: false,
        eventsFound: 0,
        eventsAdded: 0,
        eventsUpdated: 0,
        error: 'ukEvents and eventSyncStatus tables not found in schema'
    };

    /* Original implementation (disabled due to missing schema tables):
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
                    await db.insert(ukEvents).values(mappedEvent);
                    eventsAdded++;
                }
            }

            // Rate limit - wait between category fetches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Log sync status
        const syncLog: InsertEventSyncStatus = {
            source: 'ticketmaster',
            lastSyncedAt: new Date(),
            eventsFound,
            eventsAdded,
            eventsUpdated,
            status: 'success',
        };

        await db.insert(eventSyncStatus).values(syncLog);

        console.log(`[UKEvents] Ticketmaster sync complete: ${eventsFound} found, ${eventsAdded} added, ${eventsUpdated} updated`);

        return { success: true, eventsFound, eventsAdded, eventsUpdated };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[UKEvents] Sync failed:', error);

        // Log failed sync
        await db.insert(eventSyncStatus).values({
            source: 'ticketmaster',
            lastSyncedAt: new Date(),
            eventsFound,
            eventsAdded,
            eventsUpdated,
            status: 'failed',
            errorMessage,
        });

        return { success: false, eventsFound, eventsAdded, eventsUpdated, error: errorMessage };
    }
    */
}

/**
 * Get upcoming UK events with filters
 * NOTE: Disabled - ukEvents table doesn't exist in schema
 */
export async function getUKEvents(options: {
    category?: string;
    city?: string;
    genre?: string;
    limit?: number;
    offset?: number;
    featured?: boolean;
}): Promise<any[]> {
    console.warn('[UKEvents] getUKEvents disabled - table not found in schema');
    return [];
}

/**
 * Get event by ID
 * NOTE: Disabled - ukEvents table doesn't exist in schema
 */
export async function getUKEventById(id: number): Promise<any | null> {
    console.warn('[UKEvents] getUKEventById disabled - table not found in schema');
    return null;
}

/**
 * Get featured events
 * NOTE: Disabled - ukEvents table doesn't exist in schema
 */
export async function getFeaturedUKEvents(limit: number = 6): Promise<any[]> {
    console.warn('[UKEvents] getFeaturedUKEvents disabled - table not found in schema');
    return [];
}

/**
 * Search UK events
 * NOTE: Disabled - ukEvents table doesn't exist in schema
 */
export async function searchUKEvents(query: string, options: {
    category?: string;
    city?: string;
    limit?: number;
}): Promise<any[]> {
    console.warn('[UKEvents] searchUKEvents disabled - table not found in schema');
    return [];
}

/**
 * Get unique cities with events
 * NOTE: Disabled - ukEvents table doesn't exist in schema
 */
export async function getEventCities(): Promise<string[]> {
    console.warn('[UKEvents] getEventCities disabled - table not found in schema');
    return [];
}

/**
 * Get event categories with counts
 * NOTE: Disabled - ukEvents table doesn't exist in schema
 */
export async function getEventCategories(): Promise<Array<{ category: string; count: number }>> {
    console.warn('[UKEvents] getEventCategories disabled - table not found in schema');
    return [];
}

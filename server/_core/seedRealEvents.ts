
import { getDb } from "../db";
import { events } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function seedRealEvents() {
    const db = await getDb();
    if (!db) {
        console.error("Database connection failed. Is DATABASE_URL set?");
        process.exit(1);
    }

    console.log("🌱 Seeding REAL event data (Elon Apple Grade)...");

    const realEvents = [
        {
            title: "Garage Nation - The Concert",
            description: "A monumental celebration of UK Garage featuring So Solid Crew, DJ Luck & MC Neat, Heartless Crew and many more legacy acts.",
            eventDate: new Date("2026-04-03T18:30:00Z"),
            location: "The O2, London",
            imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
            ticketUrl: "https://www.theo2.co.uk",
            price: "£142",
            isFeatured: true
        },
        {
            title: "Mint Festival 2026",
            description: "Leeds' premiere electronic music gathering. Special UKG takeover in The Barn with Silva Bumpa and Enzo Siragusa.",
            eventDate: new Date("2026-05-02T12:00:00Z"),
            location: "Newsam Green Farm, Leeds",
            imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
            ticketUrl: "https://www.skiddle.com",
            price: "£45",
            isFeatured: true
        },
        {
            title: "SuncéBeat New Horizons",
            description: "Four days of quality House, Soul and UKG on the beautiful Lisbon coast. A global gathering of the tribe.",
            eventDate: new Date("2026-06-18T14:00:00Z"),
            location: "Costa da Caparica, Portugal",
            imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
            ticketUrl: "https://suncebeat.com",
            price: "€180",
            isFeatured: true
        },
        {
            title: "Garage Republic Festival",
            description: "The biggest UKG celebration in the Midlands. Notts County Ground takeover with the ultimate lineup.",
            eventDate: new Date("2026-06-20T14:00:00Z"),
            location: "Nottingham, UK",
            imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
            ticketUrl: "https://skiddle.com",
            price: "£35",
            isFeatured: false
        },
        {
            title: "Parklife 2026",
            description: "The UK's largest metropolitan festival. Catch Danny Hectic B vibes alongside Sammy Virji and Disclosure.",
            eventDate: new Date("2026-06-13T12:00:00Z"),
            location: "Heaton Park, Manchester",
            imageUrl: "https://images.unsplash.com/photo-1459749411177-042180ce673b?w=800&q=80",
            ticketUrl: "https://parklife.uk.com",
            price: "£85",
            isFeatured: true
        },
        {
            title: "Morden Park Garage Festival",
            description: "Over 100 artists across four stages. London's most essential summer garage gathering.",
            eventDate: new Date("2026-08-08T12:00:00Z"),
            location: "Morden Park, London",
            imageUrl: "https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=800&q=80",
            ticketUrl: "https://skiddle.com",
            price: "£20",
            isFeatured: false
        }
    ];

    try {
        for (const eventData of realEvents) {
            // Check if title already exists to avoid duplicates
            const existing = await db.select().from(events).where(eq(events.title, eventData.title)).limit(1);
            if (existing.length === 0) {
                await db.insert(events).values(eventData);
                console.log(`✅ Added: ${eventData.title}`);
            } else {
                console.log(`⏭️ Skipping: ${eventData.title} (Already exists)`);
            }
        }
        console.log("🏁 REAL event seeding complete.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seedRealEvents().then(() => process.exit(0));

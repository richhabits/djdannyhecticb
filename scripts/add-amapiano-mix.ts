/**
 * Add Soulful Amapiano Mix to database
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { mixes } from "../drizzle/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function addAmpianoBeatMix() {
  try {
    console.log("Adding Soulful Amapiano Mix...");

    const result = await db
      .insert(mixes)
      .values({
        title: "Soulful Amapiano Mix",
        description:
          "A soulful amapiano journey crafted by DJ Danny Hectic B. Smooth beats, deep grooves, and authentic South African house vibes. Perfect for late-night listening.",
        audioUrl: "/mixes/amapiano-soulful.mp3",
        coverImageUrl: "/logo-danny-hectic-b.png",
        duration: 3600,
        genre: "Amapiano",
        isFree: true,
        downloadUrl: "/mixes/amapiano-soulful.mp3",
      })
      .returning();

    console.log("✓ Mix added successfully!");
    console.log("Mix details:", {
      id: result[0]?.id,
      title: result[0]?.title,
      genre: result[0]?.genre,
      url: result[0]?.audioUrl,
    });

    process.exit(0);
  } catch (error) {
    console.error("✗ Error adding mix:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addAmpianoBeatMix();

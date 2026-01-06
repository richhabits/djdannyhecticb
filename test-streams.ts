/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */


import { getActiveStream, getStreamStats } from "./server/db";
import { getDb } from "./server/db";

async function test() {
    console.log("Testing DB connection...");
    const db = await getDb();
    if (!db) {
        console.error("DB connection failed");
        process.exit(1);
    }
    console.log("DB connection successful");

    console.log("Testing getActiveStream...");
    try {
        const activeStream = await getActiveStream();
        console.log("Active Stream:", activeStream);

        if (activeStream?.id) {
            console.log(`Testing getStreamStats for stream ${activeStream.id}...`);
            const stats = await getStreamStats(activeStream.id);
            console.log("Stream Stats:", stats);
        } else {
            console.log("No active stream found to test stats.");
        }

    } catch (error) {
        console.error("Error fetching stream data:", error);
    }
    process.exit(0);
}

test();

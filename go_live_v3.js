import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log("🚀 [GO-LIVE] SQL Execution Started...");

    // 1. Feature Flags
    const flags = [
        ['alerts_enabled', 1, 'Global alert broadcast'],
        ['connector_sync_enabled', 1, 'Intelligence ingestion flow'],
        ['auto_supporter_elevation', 1, 'Meritocracy engine'],
        ['admin_heatmap_enabled', 1, 'Operational intelligence']
    ];
    for (const flag of flags) {
        await connection.execute(
            'INSERT INTO feature_flags (`key`, isEnabled, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE isEnabled = 1',
            flag
        );
    }

    // 2. City Lanes
    const lanes = [
        ['London', 'london-dnb', JSON.stringify(['DnB']), 1],
        ['Manchester', 'manchester-techno', JSON.stringify(['Techno']), 1],
        ['Birmingham', 'birmingham-ukg', JSON.stringify(['UKG']), 1]
    ];
    for (const lane of lanes) {
        await connection.execute(
            'INSERT INTO city_lanes (city, slug, genres, isActive) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE isActive = 1',
            lane
        );
    }

    // 3. Connectors
    const connectors = [
        ['Ticketmaster UK', 'ticketmaster', 1, JSON.stringify({ endpoint: 'api.ticketmaster.com' })],
        ['Skiddle Events', 'skiddle', 1, JSON.stringify({ endpoint: 'api.skiddle.com' })],
        ['RA Feeds', 'ra', 1, JSON.stringify({ endpoint: 'ra.co/feeds' })]
    ];
    for (const conn of connectors) {
        await connection.execute(
            'INSERT INTO connectors (name, type, isEnabled, config) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE isEnabled = 1',
            conn
        );
    }

    console.log("✅ Network nodes initialized via SQL.");
    await connection.end();
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log("🦾 [SEED] Injecting Authoritative Signals...");

    const [lanes] = await connection.execute('SELECT id, city, genres FROM city_lanes');
    console.log("Found lanes:", lanes.length);
    const londonLane = lanes.find(l => l.city === 'London');
    const manchesterLane = lanes.find(l => l.city === 'Manchester');

    const itmes = [
        {
            laneId: londonLane ? londonLane.id : null,
            category: 'ticket-alert',
            title: 'HEDEX: MY WORLD TOUR (LIVE)',
            content: 'Massive DnB signal intercepted. Hedex taking over Wembley. Official Ticketmaster bridge verified.',
            city: 'London',
            genre: 'DnB',
            sourceType: 'ticketing_api',
            sourceName: 'Ticketmaster',
            sourceUrl: 'https://www.ticketmaster.co.uk/hedex-tickets',
            sourceId: 'tm-12345',
            confidence: '0.99',
            tags: JSON.stringify(['DnB', 'London', 'Verified']),
            publishedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            metadata: JSON.stringify({ venue: 'OVO Arena Wembley', sourceCount: 2, secondarySources: ['Skiddle'] })
        },
        {
            laneId: manchesterLane ? manchesterLane.id : null,
            category: 'ticket-alert',
            title: 'TELETECH x WAREHOUSE PROJECT',
            content: 'Multi-source confirmation: Massive Techno session at WHP. Authority nodes: RA & Skiddle.',
            city: 'Manchester',
            genre: 'Techno',
            sourceType: 'ticketing_api',
            sourceName: 'Skiddle',
            sourceUrl: 'https://ra.co/events/teletech',
            sourceId: 'ra-7766',
            confidence: '0.97',
            tags: JSON.stringify(['Techno', 'Manchester', 'Verified']),
            publishedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            metadata: JSON.stringify({ venue: 'Warehouse Project', sourceCount: 2, secondarySources: ['RA'] })
        }
    ];

    for (const item of itmes) {
        await connection.execute(
            'INSERT INTO intel_items (laneId, category, title, content, city, genre, sourceType, sourceName, sourceUrl, sourceId, confidence, tags, publishedAt, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [item.laneId, item.category, item.title, item.content, item.city, item.genre, item.sourceType, item.sourceName, item.sourceUrl, item.sourceId, item.confidence, item.tags, item.publishedAt, item.metadata]
        );
    }

    console.log("✅ Simulation sync successful. Signals online.");
    await connection.end();
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});

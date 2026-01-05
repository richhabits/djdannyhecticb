
import mysql from "mysql2/promise";

async function test() {
    console.log("Connecting to DB...");
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log("Connected. Querying active streams...");
    try {
        const [rows] = await connection.execute("SELECT * FROM streams WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1");
        console.log("Active Streams:", rows);

        if (rows.length > 0) {
            console.log("Found active stream. Querying stats...");
            // Assuming stream_stats table exists
            const streamId = rows[0].id;
            const [stats] = await connection.execute("SELECT * FROM stream_stats WHERE streamId = ?", [streamId]);
            console.log("Stream Stats:", stats);
        } else {
            console.log("No active streams found.");
        }

    } catch (error) {
        console.error("Query failed:", error);
    }
    await connection.end();
}

test();

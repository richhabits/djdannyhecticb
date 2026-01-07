import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createPool } from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.warn("[Migration] No DATABASE_URL found, skipping auto-migration.");
        return;
    }

    console.log("[Migration] Starting production database migration...");

    const connectionString = databaseUrl.includes('?')
        ? `${databaseUrl}&multipleStatements=true`
        : `${databaseUrl}?multipleStatements=true`;

    const poolConnection = createPool(connectionString);

    const db = drizzle(poolConnection);

    try {
        // Migration folder is at /app/drizzle
        const migrationsFolder = path.resolve(process.cwd(), "drizzle");
        console.log(`[Migration] Reading from: ${migrationsFolder}`);

        await migrate(db, { migrationsFolder });
        console.log("[Migration] Completed successfully!");
    } catch (error) {
        console.error("[Migration] CRITICAL FAILURE:", error);
        // Don't exit process here, let the server try to start (might partially work)
    } finally {
        await poolConnection.end();
    }
}

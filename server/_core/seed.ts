import { getDb } from "../db";
import { users, adminCredentials } from "../../drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
    const db = await getDb();
    if (!db) {
        console.error("Database connection failed. Is DATABASE_URL set?");
        process.exit(1);
    }

    console.log("🌱 Starting database seeding...");

    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@djdannyhecticb.co.uk";
        const adminPassword = process.env.ADMIN_PASSWORD || "DannyHectic2024!";

        // Check if admin already exists
        const existing = await db.select().from(adminCredentials).where(eq(adminCredentials.email, adminEmail)).limit(1);

        if (existing.length > 0) {
            console.log("✅ Admin user already exists. Skipping.");
        } else {
            console.log("👤 Creating admin user...");
            const passwordHash = await bcrypt.hash(adminPassword, 12);
            const openId = `admin-seed-${Date.now()}`;

            const [userResult] = await db.insert(users).values({
                openId,
                email: adminEmail,
                name: "Admin User",
                loginMethod: "password",
                role: "admin",
            }).returning({ id: users.id });

            const userId = userResult.id;

            await db.insert(adminCredentials).values({
                userId,
                email: adminEmail,
                passwordHash,
            });

            console.log(`✅ Admin user created: ${adminEmail}`);
        }

        // Add other default settings if needed

        console.log("🏁 Seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed().then(() => process.exit(0));

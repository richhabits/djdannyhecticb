
import { getDb } from "../db";

async function testConn() {
    console.log("Testing connection...");
    const db = await getDb();
    if (!db) {
        console.log("DB NO");
        return;
    }
    console.log("DB YES");
    process.exit(0);
}

testConn();

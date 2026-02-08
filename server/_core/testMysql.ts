
import mysql from 'mysql2/promise';

async function testMysql() {
    console.log("Connecting directly with mysql2...");
    try {
        const connection = await mysql.createConnection("mysql://root:password@127.0.0.1:3307/djdannyhecticb");
        console.log("Connected!");
        const [rows] = await connection.execute('SELECT 1 as result');
        console.log("Query result:", rows);
        await connection.end();
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

testMysql();

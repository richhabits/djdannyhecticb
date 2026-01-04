import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

async function createAdmin() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'djdannyhecticb'
  });
  
  try {
    // Create table if not exists
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id int AUTO_INCREMENT PRIMARY KEY,
        userId int NOT NULL,
        email varchar(320) NOT NULL UNIQUE,
        passwordHash varchar(255) NOT NULL,
        lastLoginAt timestamp NULL,
        failedLoginAttempts int NOT NULL DEFAULT 0,
        lockedUntil timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT (now()),
        updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    const email = 'admin@djdannyhecticb.co.uk';
    const password = 'DannyHectic2024!';
    const name = 'DJ Danny Hectic B Admin';
    
    // Check if admin exists
    const [existing] = await conn.execute('SELECT * FROM admin_credentials WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log('✅ Admin already exists');
      await conn.end();
      return;
    }
    
    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const openId = `admin-${email}-${Date.now()}`;
    
    const [userResult] = await conn.execute(
      'INSERT INTO users (openId, email, name, loginMethod, role, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?)',
      [openId, email, name, 'password', 'admin', new Date()]
    );
    
    const userId = userResult.insertId;
    
    // Create credentials
    await conn.execute(
      'INSERT INTO admin_credentials (userId, email, passwordHash) VALUES (?, ?, ?)',
      [userId, email, passwordHash]
    );
    
    console.log('✅ Admin created successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${userId}`);
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await conn.end();
    process.exit(1);
  }
}

createAdmin();


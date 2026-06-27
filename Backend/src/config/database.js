import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const createTables = async () => {
  let conn;
  try {
    conn = await pool.getConnection();

    console.log('✅ MySQL Connected');
    console.log('ADMIN_EMAIL from env:', process.env.ADMIN_EMAIL || 'not set');
    console.log('ADMIN_PASSWORD from env:', process.env.ADMIN_PASSWORD ? 'set' : 'not set');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [adminRows] = await conn.query('SELECT COUNT(*) AS count FROM admins');
    console.log('admins table count before seeding:', adminRows[0].count);

    if (adminRows[0].count === 0) {
      const adminEmail = 'admin@prestige.com';
      const adminPassword = 'Admin@123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await conn.query('INSERT INTO admins (email, password) VALUES (?, ?)', [adminEmail, hashedPassword]);
      console.log('Default admin created:', adminEmail);
    } else {
      const [existingAdmins] = await conn.query('SELECT id, email, created_at FROM admins ORDER BY id ASC');
      console.log('Existing admins:', existingAdmins);
    }

    console.log('All tables checked/created and seeded successfully.');
  } catch (error) {
    console.error('Error creating tables or seeding data:', error.message);
  } finally {
    if (conn) conn.release();
  }
};

createTables();

export default pool;
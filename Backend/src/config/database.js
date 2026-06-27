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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) DEFAULT NULL,
        subtitle TEXT DEFAULT NULL,
        content TEXT DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        image TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

    const [sectionRows] = await conn.query('SELECT COUNT(*) AS count FROM sections');
    console.log('sections table count before seeding:', sectionRows[0].count);

    if (sectionRows[0].count === 0) {
      await conn.query(
        `INSERT INTO sections (slug, title, subtitle, content, metadata, image)
         VALUES
           (?, ?, ?, ?, ?, ?),
           (?, ?, ?, ?, ?, ?),
           (?, ?, ?, ?, ?, ?),
           (?, ?, ?, ?, ?, ?)`,
        [
          'hero',
          'Hi there, I am Aman',
          'Front-End Developer & Designer',
          'I build modern web experiences and portfolio sites using React, Node.js, and Tailwind CSS.',
          JSON.stringify({ buttonText: 'Download Resume', buttonUrl: '#' }),
          null,
          'about',
          'About Me',
          'A passionate developer who turns design into responsive, high-performance web experiences.',
          'I create user-centered web applications with clean code and polished UI.',
          null,
          null,
          'contact',
          'Get in Touch',
          'Feel free to reach out for any project or collaboration.',
          'Email me at example@domain.com or use the contact form to send a message.',
          null,
          null,
          'footer',
          'Stay Connected',
          'Thanks for visiting my portfolio.',
          'Follow me on social media or send an email to stay in touch.',
          null,
          null,
        ]
      );
      console.log('Default section content seeded.');
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
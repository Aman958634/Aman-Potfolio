import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'portfolio_db';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
// Ensure database exists, then create a pool connected to it
const ensureDatabaseAndTables = async () => {
  // Connect without database to create it if missing
  const tmpConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await tmpConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await tmpConn.end();

  // Create pool connected to the database
  const pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Ensure essential tables exist
  const createAdmins = `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createSections = `
    CREATE TABLE IF NOT EXISTS sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255),
      subtitle VARCHAR(255),
      content TEXT,
      image VARCHAR(1024),
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createContacts = `
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createProjects = `
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(1024),
      link VARCHAR(1024),
      tech_stack VARCHAR(1024),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createSkills = `
    CREATE TABLE IF NOT EXISTS skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      level VARCHAR(100),
      icon VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createExperience = `
    CREATE TABLE IF NOT EXISTS experience (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      duration VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createServices = `
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      icon VARCHAR(255),
      position INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createTestimonials = `
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      text TEXT,
      rating INT DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createSettings = `
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(255) NOT NULL UNIQUE,
      value TEXT,
      metadata TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createAnalytics = `
    CREATE TABLE IF NOT EXISTS analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      metric_key VARCHAR(255) NOT NULL,
      metric_value VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const conn = await pool.getConnection();
  try {
    await conn.query(createAdmins);
    await conn.query(createSections);
    await conn.query('ALTER TABLE sections ADD COLUMN IF NOT EXISTS image VARCHAR(1024)');
    await conn.query(createContacts);
    await conn.query(createProjects);
    await conn.query(createSkills);
    await conn.query('ALTER TABLE skills ADD COLUMN IF NOT EXISTS icon VARCHAR(255)');
    await conn.query(createExperience);
    await conn.query(createServices);
    await conn.query(createTestimonials);
    await conn.query(createSettings);
    await conn.query(createAnalytics);

    const [existingAdmins] = await conn.query('SELECT COUNT(*) as cnt FROM admins');
    const adminCount = existingAdmins[0]?.cnt || 0;
    if (adminCount === 0 && ADMIN_EMAIL && ADMIN_PASSWORD) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await conn.query('INSERT INTO admins (email, password) VALUES (?, ?)', [ADMIN_EMAIL, hashedPassword]);
      console.log(`✅ Default admin created: ${ADMIN_EMAIL}`);
    }

    const [existingSections] = await conn.query('SELECT COUNT(*) as cnt FROM sections');
    if (existingSections[0]?.cnt === 0) {
      const defaultSections = [
        ['hero', 'Amanullah', 'Full Stack Developer', 'I build modern, scalable, and performance-driven web applications with polished UI, premium spacing, and a luxury minimal aesthetic.', '/uploads/default-hero.jpg', JSON.stringify({
          primaryButtonLabel: 'Hire Me',
          primaryButtonLink: '#contact',
          secondaryButtonLabel: 'View Work',
          secondaryButtonLink: '#projects',
          heroStats: [
            { label: 'Projects', value: '28+' },
            { label: 'Clients', value: '18+' },
            { label: 'Experience', value: '3+ Years' },
          ],
        })],
        ['about', 'Professional digital products with premium execution', 'I turn ideas into reality with clean code, beautiful interfaces, and strategic product thinking.', 'I build modern, scalable, and performance-driven web applications with polished UI, premium spacing, and a luxury minimal aesthetic.', '/uploads/default-about.jpg', JSON.stringify({
          stats: [
            { label: 'Experience', value: '3+ Years' },
            { label: 'Projects', value: '28+ Completed' },
            { label: 'Clients', value: '18+ Worldwide' },
            { label: 'Satisfaction', value: '100% Rated' },
          ],
        })],
        ['contact', 'Let’s Chat', 'Have a project or question? I’d love to hear from you.', 'Reach out using the form below and I will get back to you soon.', null, JSON.stringify({
          contactEmail: 'amanulla@example.com',
          contactLocation: 'Karachi, Pakistan',
          contactAvailability: 'Available for new projects',
        })],
        ['footer', 'Stay Connected', '', 'Follow along for the latest updates, projects, and insights.', JSON.stringify({
          socials: [
            { label: 'LinkedIn', url: 'https://linkedin.com/in/amanullah' },
            { label: 'GitHub', url: 'https://github.com/amanullah' },
            { label: 'Twitter', url: 'https://twitter.com/amanullah' },
          ],
        })],
      ];
      await conn.query('INSERT INTO sections (slug, title, subtitle, content, metadata) VALUES ?', [defaultSections]);
      console.log('✅ Default section records inserted');
    }

    const [existingSettings] = await conn.query('SELECT COUNT(*) as cnt FROM settings');
    if (existingSettings[0]?.cnt === 0) {
      const defaultSettings = [
        ['contactEmail', 'amanulla@example.com', null],
        ['contactLocation', 'Karachi, Pakistan', null],
        ['contactAvailability', 'Available for new projects', null],
      ];
      await conn.query('INSERT INTO settings (setting_key, value, metadata) VALUES ?', [defaultSettings]);
      console.log('✅ Default settings inserted');
    }

    const [existingProjects] = await conn.query('SELECT COUNT(*) as cnt FROM projects');
    if (existingProjects[0]?.cnt === 0) {
      const defaultProjects = [
        ['Portfolio Website', 'A polished and responsive personal portfolio built with React, Tailwind CSS, and Node.js.', '', 'https://example.com', 'React,Node.js,MySQL'],
        ['E-commerce Dashboard', 'An admin dashboard for managing products, orders, and analytics in real time.', '', 'https://example.com', 'React,Express,MySQL'],
      ];
      await conn.query('INSERT INTO projects (title, description, image, link, tech_stack) VALUES ?', [defaultProjects]);
      console.log('✅ Default projects inserted');
    }

    const [existingSkills] = await conn.query('SELECT COUNT(*) as cnt FROM skills');
    if (existingSkills[0]?.cnt === 0) {
      const defaultSkills = [
        ['React', 'Advanced', '⚛️'],
        ['Node.js', 'Advanced', '🟢'],
        ['Tailwind CSS', 'Advanced', '🌬️'],
        ['MySQL', 'Intermediate', '🐬'],
      ];
      await conn.query('INSERT INTO skills (name, level, icon) VALUES ?', [defaultSkills]);
      console.log('✅ Default skills inserted');
    }

    // Backfill icons for any existing skills that are missing an icon value
    const skillIconMap = [
      { match: 'react', icon: '⚛️' },
      { match: 'node', icon: '🟢' },
      { match: 'tailwind', icon: '🌬️' },
      { match: 'mysql', icon: '🐬' },
      { match: 'typescript', icon: '🟦' },
      { match: 'javascript', icon: '🟨' },
      { match: 'html', icon: '🟥' },
      { match: 'php', icon: '🐘' },
      { match: 'mongodb', icon: '🍃' },
      { match: 'git', icon: '🔧' },
      { match: 'figma', icon: '🎨' },
      { match: 'bootstrap', icon: '🅱️' },
    ];

    for (const entry of skillIconMap) {
      try {
        // Update only rows where icon is NULL or empty
        await conn.query(
          'UPDATE skills SET icon = ? WHERE (icon IS NULL OR icon = "") AND LOWER(name) LIKE ?',
          [entry.icon, `%${entry.match}%`]
        );
      } catch (e) {
        console.warn('Failed to backfill icon for', entry.match, e.message || e);
      }
    }

    const [existingExperience] = await conn.query('SELECT COUNT(*) as cnt FROM experience');
    if (existingExperience[0]?.cnt === 0) {
      const defaultExperience = [
        ['Full Stack Developer', 'Digital Agency', '2019 - 2021', 'Built scalable web applications and collaborated with design teams to deliver polished user experiences.'],
        ['Lead Developer', 'Tech Studio', '2021 - Present', 'Leading frontend and backend development for customer-facing SaaS products.'],
      ];
      await conn.query('INSERT INTO experience (role, company, duration, description) VALUES ?', [defaultExperience]);
      console.log('✅ Default experience inserted');
    }

    const [existingServices] = await conn.query('SELECT COUNT(*) as cnt FROM services');
    if (existingServices[0]?.cnt === 0) {
      const defaultServices = [
        ['Web Development', 'Custom full-stack web applications with modern UI and strong performance.', 'code', 1],
        ['UI/UX Design', 'Beautiful and usable interfaces that create premium digital experiences.', 'design', 2],
      ];
      await conn.query('INSERT INTO services (title, description, icon, position) VALUES ?', [defaultServices]);
      console.log('✅ Default services inserted');
    }

    const [existingTestimonials] = await conn.query('SELECT COUNT(*) as cnt FROM testimonials');
    if (existingTestimonials[0]?.cnt === 0) {
      const defaultTestimonials = [
        ['Sarah Khan', 'Product Manager', 'Amanullah delivered our product on time with exceptional quality.', 5],
        ['Ali Raza', 'Founder', 'Very professional and detail-oriented throughout the entire project.', 5],
      ];
      await conn.query('INSERT INTO testimonials (name, role, text, rating) VALUES ?', [defaultTestimonials]);
      console.log('✅ Default testimonials inserted');
    }
  } finally {
    conn.release();
  }

  return pool;
};

let poolPromise = null;
const getPool = async () => {
  if (!poolPromise) poolPromise = ensureDatabaseAndTables();
  return poolPromise;
};

// Attempt to initialize DB; on failure, export a safe dummy pool so server still starts.
let exportedPool;
try {
  exportedPool = await getPool();
} catch (err) {
  console.error('⚠️ Database initialization failed:', err.message);
  console.error('The server will start but DB queries will return empty results until the database is fixed.');

  // Dummy connection/pool that returns empty arrays and no-ops for release
  exportedPool = {
    getConnection: async () => ({
      query: async () => [[], []],
      release: () => {},
    }),
  };
}

export default exportedPool;

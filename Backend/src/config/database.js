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

const defaultSections = [
  {
    slug: 'hero',
    title: 'Amanullah',
    subtitle: 'Full Stack Developer',
    content: 'I build modern, scalable, and performance-driven web applications with polished UI, premium spacing, and a luxury minimal aesthetic.',
    metadata: {
      projectsLink: '#projects',
      heroSkills: [
        { name: 'React', icon: 'React' },
        { name: 'Node.js', icon: 'Node' },
        { name: 'MySQL', icon: 'SQL' },
        { name: 'Tailwind', icon: 'TW' },
        { name: 'Figma', icon: 'UI' },
        { name: 'TypeScript', icon: 'TS' },
      ],
    },
    image: null,
  },
  {
    slug: 'about',
    title: "Hi, I'm Amanulla",
    subtitle: 'Full Stack Developer',
    content: 'I build modern, scalable, and user-friendly web applications with clean code and exceptional digital experiences.',
    metadata: {
      profileTitle: 'FULL STACK DEVELOPER',
      profileName: 'Amanulla',
      profileDescription: 'Available for freelance projects and long-term product development.',
      cvLabel: 'Download CV',
      cvLink: '/resume.pdf',
      projectsCompleted: '15+',
      happyClients: '10+',
    },
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    slug: 'contact',
    title: 'Contact',
    subtitle: "Let's create something amazing together.",
    content: "Send a message and let's turn your next idea into a premium digital product.",
    metadata: null,
    image: null,
  },
  {
    slug: 'footer',
    title: 'Amanulla',
    subtitle: 'Full Stack Developer',
    content: 'A modern portfolio crafted for founders and premium digital products with beautiful interactions and refined spacing.',
    metadata: {
      subtitle: 'Privacy Policy - Terms & Conditions',
      socialLinks: [
        { name: 'GitHub', icon: 'GH', url: 'https://github.com/Aman958634' },
        { name: 'LinkedIn', icon: 'IN', url: 'https://linkedin.com' },
        { name: 'Twitter', icon: 'X', url: 'https://x.com' },
        { name: 'Email', icon: '@', url: 'mailto:amanullaathaniya@gmail.com' },
      ],
    },
    image: null,
  },
];

const defaultServices = [
  ['Web Development', 'Build responsive, fast, and modern web applications with React, Node.js, and Tailwind CSS.', 'WD', 1],
  ['UI/UX Design', 'Design polished interfaces focused on clarity, usability, and consistent branding.', 'UI', 2],
  ['E-Commerce Solutions', 'Create secure online stores with checkout flow, product management, and performance optimizations.', 'EC', 3],
];

const defaultProjects = [
  ['E-Commerce Platform', 'A premium shopping experience with clean product discovery, smooth checkout, and admin-ready product management.', 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&h=700&fit=crop', 'https://github.com', 'React, Node.js, MySQL, Stripe'],
  ['Hospital Management App', 'A secure healthcare dashboard for appointments, patient records, and staff coordination.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1000&h=700&fit=crop', 'https://github.com', 'React, Express, MySQL, Admin Panel'],
  ['Digital Marketing Campaign', 'A brand-first campaign showcase with conversion-focused sections and analytics-ready presentation.', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop', 'https://github.com', 'React, Tailwind CSS, SEO, Analytics'],
  ['Restaurant Ordering System', 'A polished ordering interface for menu browsing, cart flows, and fast customer checkout.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=700&fit=crop', 'https://github.com', 'React, Node.js, API, POS'],
  ['Fitness Tracker App', 'A modern wellness app for workouts, goal tracking, and progress visualization.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop', 'https://github.com', 'React Native, Charts, Health, Mobile'],
  ['School ERP System', 'An organized school management portal for academics, communication, and administration.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=700&fit=crop', 'https://github.com', 'React, Node.js, ERP, Dashboard'],
];

const defaultSkills = [
  ['HTML', 'Advanced', 'HTML'],
  ['CSS', 'Advanced', 'CSS'],
  ['JavaScript', 'Advanced', 'JS'],
  ['Node.js', 'Advanced', 'Node'],
  ['React', 'Advanced', 'React'],
  ['Express.js', 'Advanced', 'EX'],
  ['MongoDB', 'Intermediate', 'DB'],
  ['Git & GitHub', 'Advanced', 'Git'],
  ['TypeScript', 'Advanced', 'TS'],
  ['Tailwind CSS', 'Advanced', 'TW'],
];

const defaultExperience = [
  ['Senior Full Stack Developer', 'Tech Solutions Pvt. Ltd.', '2023 - Present', 'Building scalable web applications and mentoring engineering teams.'],
  ['Full Stack Developer', 'Web Innovators', '2021 - 2023', 'Delivered polished digital products using modern frontend and backend stacks.'],
  ['Frontend Developer', 'Design Studio', '2020 - 2021', 'Crafted beautiful UI experiences for web and mobile applications.'],
];

const defaultTestimonials = [
  ['Ravi Sharma', 'CEO, TechCorp', 'Amanulla transformed our platform with a premium interface and strong engineering discipline. The experience was seamless and on time.', 5],
  ['Priya Patel', 'Founder, StartupX', 'The design felt very modern and clean. The app performance, responsiveness and attention to detail were excellent.', 5],
  ['John Doe', 'Manager, DejaSolutions', 'Professional communication, fast delivery, and a truly premium finish. I highly recommend Amanulla for startup projects.', 5],
];

const defaultSettings = [
  ['contactEmail', 'amanullaathaniya@gmail.com', null],
  ['contactLocation', 'India, Gujarat', null],
  ['contactAvailability', 'Open for freelance & full-time', null],
];

const seedTableIfEmpty = async (conn, tableName, insertSql, values) => {
  const [rows] = await conn.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
  if (Number(rows[0].count) === 0) {
    await conn.query(insertSql, [values]);
    console.log(`Default ${tableName} data seeded.`);
  }
};

const ensureColumn = async (conn, tableName, columnName, columnDefinition) => {
  const [columns] = await conn.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  if (columns.length === 0) {
    await conn.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    console.log(`Added ${tableName}.${columnName} column.`);
  }
};

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

    await conn.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100) DEFAULT NULL,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image TEXT DEFAULT NULL,
        link VARCHAR(500) DEFAULT NULL,
        tech_stack VARCHAR(500) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        level VARCHAR(50) DEFAULT 'Advanced',
        icon VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(200) NOT NULL,
        company VARCHAR(200) DEFAULT NULL,
        duration VARCHAR(100) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        role VARCHAR(200) DEFAULT NULL,
        text TEXT NOT NULL,
        rating INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        subject VARCHAR(200) DEFAULT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metric_key VARCHAR(100) NOT NULL,
        metric_value VARCHAR(100) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query("ALTER TABLE skills MODIFY COLUMN level VARCHAR(50) DEFAULT 'Advanced'");
    await ensureColumn(conn, 'skills', 'icon', 'VARCHAR(100) DEFAULT NULL');
    await ensureColumn(conn, 'services', 'icon', 'VARCHAR(100) DEFAULT NULL');
    await ensureColumn(conn, 'services', 'position', 'INT DEFAULT 0');
    await ensureColumn(conn, 'settings', 'metadata', 'JSON DEFAULT NULL');

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

    for (const section of defaultSections) {
      await conn.query(
        `INSERT INTO sections (slug, title, subtitle, content, metadata, image)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE slug = slug`,
        [
          section.slug,
          section.title,
          section.subtitle,
          section.content,
          section.metadata ? JSON.stringify(section.metadata) : null,
          section.image,
        ]
      );
    }

    await seedTableIfEmpty(
      conn,
      'services',
      'INSERT INTO services (title, description, icon, position) VALUES ?',
      defaultServices
    );

    await seedTableIfEmpty(
      conn,
      'projects',
      'INSERT INTO projects (title, description, image, link, tech_stack) VALUES ?',
      defaultProjects
    );

    await seedTableIfEmpty(
      conn,
      'skills',
      'INSERT INTO skills (name, level, icon) VALUES ?',
      defaultSkills
    );

    await seedTableIfEmpty(
      conn,
      'experience',
      'INSERT INTO experience (role, company, duration, description) VALUES ?',
      defaultExperience
    );

    await seedTableIfEmpty(
      conn,
      'testimonials',
      'INSERT INTO testimonials (name, role, text, rating) VALUES ?',
      defaultTestimonials
    );

    for (const setting of defaultSettings) {
      await conn.query(
        `INSERT INTO settings (setting_key, value, metadata)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_key = setting_key`,
        setting
      );
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

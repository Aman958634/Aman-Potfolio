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
  try {
    const conn = await pool.getConnection();

    console.log('✅ MySQL Connected');

    // Admins Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(1024),
        link VARCHAR(1024),
        tech_stack VARCHAR(1024),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Skills Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        image VARCHAR(1024),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Experience Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        description TEXT,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Services Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Testimonials Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_title VARCHAR(255),
        quote TEXT NOT NULL,
        image VARCHAR(1024),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Contacts Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sections Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        image VARCHAR(1024),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Settings Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_title VARCHAR(255) NOT NULL DEFAULT 'My Portfolio',
        hero_title VARCHAR(255) NOT NULL DEFAULT 'Hello, I\'m [Your Name]',
        hero_subtitle VARCHAR(255) NOT NULL DEFAULT 'A Passionate Developer',
        about_text TEXT,
        contact_email VARCHAR(255),
        github_url VARCHAR(1024),
        linkedin_url VARCHAR(1024),
        twitter_url VARCHAR(1024),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Users Table (if different from admins)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Analytics Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_views INT DEFAULT 0,
        unique_visitors INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create default admin user
    const [adminRows] = await conn.query('SELECT COUNT(*) AS count FROM admins');
    if (adminRows[0].count === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await conn.query('INSERT INTO admins (email, password) VALUES (?, ?)', [adminEmail, hashedPassword]);
      console.log('Default admin user created.');
    }

    // Seed data (basic examples, expand as needed)
    // Projects
    const [projectRows] = await conn.query('SELECT COUNT(*) AS count FROM projects');
    if (projectRows[0].count === 0) {
      await conn.query(`
        INSERT INTO projects (title, description, image, link, tech_stack) VALUES
        ('Portfolio Website', 'A personal portfolio website built with React and Node.js.', 'https://example.com/project1.png', 'https://github.com/aman-web-dev/portfolio', 'React, Node.js, Express, MySQL'),
        ('E-commerce Platform', 'Full-stack e-commerce solution with user authentication and payment gateway.', 'https://example.com/project2.png', 'https://github.com/aman-web-dev/ecommerce', 'React, Node.js, MongoDB, Stripe'),
        ('Task Management App', 'A simple task management application for increased productivity.', 'https://example.com/project3.png', 'https://github.com/aman-web-dev/task-app', 'Vue.js, Firebase'),
        ('Blog Platform', 'A robust blogging platform with admin panel.', 'https://example.com/project4.png', 'https://github.com/aman-web-dev/blog-platform', 'Angular, Spring Boot, PostgreSQL'),
        ('Social Media Dashboard', 'Dashboard to track social media metrics and trends.', 'https://example.com/project5.png', 'https://github.com/aman-web-dev/social-dashboard', 'React, Python, Django, REST API'),
        ('Weather Application', 'Real-time weather application using external APIs.', 'https://example.com/project6.png', 'https://github.com/aman-web-dev/weather-app', 'JavaScript, HTML, CSS, OpenWeather API')
      `);
      console.log('Projects seed data inserted.');
    }

    // Skills
    const [skillRows] = await conn.query('SELECT COUNT(*) AS count FROM skills');
    if (skillRows[0].count === 0) {
      await conn.query(`
        INSERT INTO skills (name, image) VALUES
        ('React', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'),
        ('Node.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'),
        ('Express.js', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg'),
        ('MySQL', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'),
        ('MongoDB', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'),
        ('JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'),
        ('HTML5', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'),
        ('CSS3', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg')
      `);
      console.log('Skills seed data inserted.');
    }

    // Experience
    const [experienceRows] = await conn.query('SELECT COUNT(*) AS count FROM experience');
    if (experienceRows[0].count === 0) {
      await conn.query(`
        INSERT INTO experience (title, company, description, start_date, end_date) VALUES
        ('Software Engineer', 'Tech Solutions Inc.', 'Developed and maintained web applications using React and Node.js.', '2023-01-01', '2024-01-01'),
        ('Junior Developer', 'Web Innovations', 'Assisted in the development of client websites and learned new technologies.', '2022-01-01', '2022-12-31'),
        ('Intern', 'Creative Agency', 'Worked on various frontend tasks and supported the development team.', '2021-06-01', '2021-08-31')
      `);
      console.log('Experience seed data inserted.');
    }

    // Services
    const [serviceRows] = await conn.query('SELECT COUNT(*) AS count FROM services');
    if (serviceRows[0].count === 0) {
      await conn.query(`
        INSERT INTO services (name, description, icon) VALUES
        ('Web Development', 'Building responsive and dynamic web applications.', 'FaLaptopCode'),
        ('API Development', 'Designing and implementing robust RESTful APIs.', 'FaServer'),
        ('Database Management', 'Setting up and managing efficient databases.', 'FaDatabase'),
        ('UI/UX Design', 'Creating intuitive and engaging user interfaces.', 'FaPaintBrush'),
        ('Cloud Deployment', 'Deploying applications to cloud platforms like Azure and Railway.', 'FaCloud'),
        ('Consulting', 'Providing technical guidance and solutions.', 'FaLightbulb')
      `);
      console.log('Services seed data inserted.');
    }

    // Testimonials
    const [testimonialRows] = await conn.query('SELECT COUNT(*) AS count FROM testimonials');
    if (testimonialRows[0].count === 0) {
      await conn.query(`
        INSERT INTO testimonials (client_name, client_title, quote, image) VALUES
        ('Jane Doe', 'CEO, Example Corp', 'Aman is an exceptional developer, truly a pleasure to work with!', 'https://randomuser.me/api/portraits/women/1.jpg'),
        ('John Smith', 'CTO, Tech Solutions', 'His problem-solving skills and dedication are unmatched.', 'https://randomuser.me/api/portraits/men/1.jpg'),
        ('Emily White', 'Project Manager', 'Delivered outstanding results on time and within budget.', 'https://randomuser.me/api/portraits/women/2.jpg'),
        ('David Green', 'Freelance Client', 'Highly recommend Aman for any web development project.', 'https://randomuser.me/api/portraits/men/2.jpg')
      `);
      console.log('Testimonials seed data inserted.');
    }

    // Sections (Home, About, Contact)
    const [sectionRows] = await conn.query('SELECT COUNT(*) AS count FROM sections');
    if (sectionRows[0].count === 0) {
      await conn.query(`
        INSERT INTO sections (slug, title, content) VALUES
        ('home', 'Welcome to My Portfolio', 'This is the home section content.'),
        ('about', 'About Me', 'This is the about section content, detailing my journey and skills.'),
        ('contact', 'Get in Touch', 'This is the contact section content, with information on how to reach me.')
      `);
      console.log('Sections seed data inserted.');
    }

    // Settings
    const [settingRows] = await conn.query('SELECT COUNT(*) AS count FROM settings');
    if (settingRows[0].count === 0) {
      await conn.query(`
        INSERT INTO settings (site_title, hero_title, hero_subtitle, about_text, contact_email, github_url, linkedin_url, twitter_url) VALUES
        ('Aman's Portfolio', 'Hi, I\'m Aman!', 'Full Stack Developer', 'I am a passionate full stack developer with experience in building web applications using modern technologies.', 'aman@example.com', 'https://github.com/aman-web-dev', 'https://linkedin.com/in/aman-web-dev', 'https://twitter.com/aman-web-dev')
      `);
      console.log('Settings seed data inserted.');
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
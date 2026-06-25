-- Database Schema for Developer Portfolio

-- Create Database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(500),
  link VARCHAR(500),
  tech_stack VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level INT DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Experience Table
CREATE TABLE IF NOT EXISTS experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  duration VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sections Table for admin-managed page content
CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  content TEXT,
  metadata TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins table for backend authentication
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Data

-- Sample Projects
INSERT INTO projects (title, description, image, link, tech_stack) VALUES
('E-Commerce Platform', 'Full-stack e-commerce platform with React, Node.js, and MySQL', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop', 'https://github.com', 'React, Node.js, MySQL, Stripe'),
('Social Media Dashboard', 'Analytics dashboard for social media metrics and insights', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop', 'https://github.com', 'React, Express, PostgreSQL, Chart.js'),
('Task Management App', 'Real-time collaborative task management tool with live updates', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop', 'https://github.com', 'Vue, Node.js, MongoDB, Socket.io'),
('AI Chat Bot', 'Intelligent chatbot powered by machine learning algorithms', 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=500&h=300&fit=crop', 'https://github.com', 'Python, TensorFlow, Flask, React'),
('Mobile Weather App', 'Cross-platform weather application with real-time data', 'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=500&h=300&fit=crop', 'https://github.com', 'React Native, Expo, Weather API'),
('Blog Platform', 'Markdown-based blog platform with SEO optimization', 'https://images.unsplash.com/photo-1502384750566-40bbc5b0287b?w=500&h=300&fit=crop', 'https://github.com', 'Next.js, Tailwind, MongoDB, Vercel');

-- Sample Skills
INSERT INTO skills (name, level) VALUES
('React & Vue', 95),
('Node.js & Express', 90),
('MySQL & MongoDB', 88),
('Tailwind CSS', 95),
('GSAP & Animations', 92),
('TypeScript', 85),
('Docker & DevOps', 80),
('AWS & Cloud Services', 82),
('GraphQL', 78),
('RESTful APIs', 92);

-- Sample Experience
INSERT INTO experience (role, company, duration, description) VALUES
('Senior Full Stack Developer', 'Tech Company Inc', '2021 - Present', 'Leading development of scalable applications, mentoring junior developers, and architecting microservices'),
('Full Stack Developer', 'Digital Agency', '2019 - 2021', 'Developed web applications using React and Node.js for various clients, managed databases and deployments'),
('Junior Web Developer', 'Startup Studio', '2018 - 2019', 'Started my career building responsive websites, learning modern frameworks and best practices');

-- Sample Section Content
INSERT INTO sections (slug, title, subtitle, content, metadata) VALUES
('about', 'About Me', 'A professional overview of my experience and strengths.', 'I am a passionate full-stack developer who builds polished applications with strong performance and modern UX, focusing on elegant solutions and consistent delivery.', '["Building scalable web applications","Creating memorable digital experiences","Delivering products with strong technical quality"]'),
('contact', 'Get In Touch', 'Professional support for every project.', 'Have a question or project in mind? I’m ready to collaborate, advise on technical strategy, and deliver results.', NULL),
('footer', 'Your Name', 'Designed & built with ❤️ using React, Tailwind CSS & GSAP.', 'Crafting elegant digital experiences with modern web technologies.', '{"socialLinks":[{"name":"GitHub","icon":"💻","url":"https://github.com"},{"name":"LinkedIn","icon":"🔗","url":"https://linkedin.com"},{"name":"Twitter","icon":"𝕏","url":"https://twitter.com"},{"name":"Email","icon":"📧","url":"mailto:your@email.com"}]}');

-- Create Indexes for better performance
CREATE INDEX idx_projects_created ON projects(created_at);
CREATE INDEX idx_experience_id ON experience(id);
CREATE INDEX idx_contacts_created ON contacts(created_at);

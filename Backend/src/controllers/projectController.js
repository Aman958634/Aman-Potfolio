import pool from '../config/database.js';

const setNoCacheHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
};

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return false;
  }

  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

const getFallbackImage = (title = '') => {
  const normalizedTitle = String(title || '').toLowerCase();

  if (normalizedTitle.includes('hospital')) {
    return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('marketing')) {
    return 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('restaurant')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('fitness')) {
    return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop';
  }

  if (normalizedTitle.includes('school')) {
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=700&fit=crop';
  }

  return 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&h=700&fit=crop';
};

const normalizeProjectRow = (project) => ({
  ...project,
  image: isRenderableImageSource(project?.image) ? project.image : getFallbackImage(project?.title),
});

const sanitizeProjectInput = ({ title, description, image, link, tech_stack }) => ({
  title: typeof title === 'string' ? title.trim() : '',
  description: typeof description === 'string' ? description.trim() : '',
  image: isRenderableImageSource(image) ? image.trim() : getFallbackImage(title),
  link: typeof link === 'string' ? link.trim() : '',
  tech_stack: typeof tech_stack === 'string' ? tech_stack.trim() : '',
});

const seedProjects = [
  [
    'E-Commerce Platform',
    'A premium shopping experience with clean product discovery, smooth checkout, and admin-ready product management.',
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&h=700&fit=crop',
    'https://github.com',
    'React, Node.js, MySQL, Stripe',
  ],
  [
    'Hospital Management App',
    'A secure healthcare dashboard for appointments, patient records, and staff coordination.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1000&h=700&fit=crop',
    'https://github.com',
    'React, Express, MySQL, Admin Panel',
  ],
  [
    'Digital Marketing Campaign',
    'A brand-first campaign showcase with conversion-focused sections and analytics-ready presentation.',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000&h=700&fit=crop',
    'https://github.com',
    'React, Tailwind CSS, SEO, Analytics',
  ],
  [
    'Restaurant Ordering System',
    'A polished ordering interface for menu browsing, cart flows, and fast customer checkout.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&h=700&fit=crop',
    'https://github.com',
    'React, Node.js, API, POS',
  ],
  [
    'Fitness Tracker App',
    'A modern wellness app for workouts, goal tracking, and progress visualization.',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&h=700&fit=crop',
    'https://github.com',
    'React Native, Charts, Health, Mobile',
  ],
  [
    'School ERP System',
    'An organized school management portal for academics, communication, and administration.',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&h=700&fit=crop',
    'https://github.com',
    'React, Node.js, ERP, Dashboard',
  ],
];

let hasCheckedProjectSeed = false;

const seedProjectsIfNeeded = async (connection) => {
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM projects');

  if (Number(count) > 0) {
    return;
  }

  await connection.query(
    'INSERT INTO projects (title, description, image, link, tech_stack) VALUES ?',
    [seedProjects.map((project) => [project[0], project[1], project[2], project[3], project[4]])]
  );
};

export const getAllProjects = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const connection = await pool.getConnection();
    if (!hasCheckedProjectSeed) {
      await seedProjectsIfNeeded(connection);
      hasCheckedProjectSeed = true;
    }
    const [projects] = await connection.query('SELECT * FROM projects');
    connection.release();
    res.json(projects.map(normalizeProjectRow));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [projects] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);
    connection.release();

    if (projects.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(normalizeProjectRow(projects[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, image, link, tech_stack } = sanitizeProjectInput(req.body);
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO projects (title, description, image, link, tech_stack) VALUES (?, ?, ?, ?, ?)',
      [title, description, image, link, tech_stack]
    );

    const [rows] = await connection.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);

    connection.release();
    res.status(201).json({
      message: 'Project created successfully',
      project: normalizeProjectRow(rows[0]),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, link, tech_stack } = sanitizeProjectInput(req.body);
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE projects SET title = ?, description = ?, image = ?, link = ?, tech_stack = ? WHERE id = ?',
      [title, description, image, link, tech_stack, id]
    );

    if (result.affectedRows === 0) {
      connection.release();
      return res.status(404).json({ message: 'Project not found' });
    }

    const [rows] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);

    connection.release();
    res.json({
      message: 'Project updated successfully',
      project: normalizeProjectRow(rows[0]),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM projects WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

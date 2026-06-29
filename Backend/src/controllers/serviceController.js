import pool from '../config/database.js';

const defaultServices = [
  ['Web Development', 'Build responsive, fast, and modern web applications with React, Node.js, and Tailwind CSS.', 'WD', 1],
  ['UI/UX Design', 'Design polished interfaces focused on clarity, usability, and consistent branding.', 'UI', 2],
  ['E-Commerce Solutions', 'Create secure online stores with checkout flow, product management, and performance optimizations.', 'EC', 3],
];

const ensureServicesReady = async (connection) => {
  await connection.query(`
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

  const [iconColumn] = await connection.query('SHOW COLUMNS FROM services LIKE ?', ['icon']);
  if (iconColumn.length === 0) {
    await connection.query('ALTER TABLE services ADD COLUMN icon VARCHAR(100) DEFAULT NULL');
  }

  const [positionColumn] = await connection.query('SHOW COLUMNS FROM services LIKE ?', ['position']);
  if (positionColumn.length === 0) {
    await connection.query('ALTER TABLE services ADD COLUMN position INT DEFAULT 0');
  }

  const [rows] = await connection.query('SELECT COUNT(*) AS count FROM services');
  if (Number(rows[0].count) === 0) {
    await connection.query(
      'INSERT INTO services (title, description, icon, position) VALUES ?',
      [defaultServices]
    );
  }
};

export const getAllServices = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureServicesReady(connection);
    const [services] = await connection.query('SELECT * FROM services ORDER BY position ASC, id DESC');
    connection.release();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await ensureServicesReady(connection);
    const [services] = await connection.query('SELECT * FROM services WHERE id = ?', [id]);
    connection.release();

    if (services.length === 0) return res.status(404).json({ message: 'Service not found' });
    res.json(services[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createService = async (req, res) => {
  try {
    const { title, description, icon, position } = req.body;
    const connection = await pool.getConnection();
    await ensureServicesReady(connection);
    await connection.query(
      'INSERT INTO services (title, description, icon, position) VALUES (?, ?, ?, ?)',
      [title, description, icon, position || 0]
    );
    connection.release();
    res.status(201).json({ message: 'Service created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, position } = req.body;
    const connection = await pool.getConnection();
    await ensureServicesReady(connection);
    await connection.query(
      'UPDATE services SET title = ?, description = ?, icon = ?, position = ? WHERE id = ?',
      [title, description, icon, position || 0, id]
    );
    connection.release();
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await ensureServicesReady(connection);

    // Retrieve the target service first
    const [rows] = await connection.query('SELECT * FROM services WHERE id = ?', [id]);
    if (rows.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Service not found' });
    }

    const svc = rows[0];

    // Remove only the exact id (delete only the clicked item)
    const [byIdResult] = await connection.query('DELETE FROM services WHERE id = ?', [id]);

    connection.release();

    const deletedCount = byIdResult.affectedRows || 0;
    console.log(`deleteService: targetId=${id} deleted=${deletedCount} (byId=${deletedCount})`);

    res.json({ message: 'Service deleted successfully', deleted: deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

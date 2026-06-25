import pool from '../config/database.js';

export const getAllServices = async (req, res) => {
  try {
    const connection = await pool.getConnection();
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
import pool from '../config/database.js';

const setNoCacheHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
};

export const getAllExperience = async (req, res) => {
  try {
    setNoCacheHeaders(res);
    const connection = await pool.getConnection();
    const [experience] = await connection.query('SELECT * FROM experience ORDER BY id DESC');
    connection.release();
    res.json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExperience = async (req, res) => {
  try {
    const { role, company, duration, description } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO experience (role, company, duration, description) VALUES (?, ?, ?, ?)',
      [role, company, duration, description]
    );

    connection.release();
    res.status(201).json({ message: 'Experience created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, company, duration, description } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE experience SET role = ?, company = ?, duration = ?, description = ? WHERE id = ?',
      [role, company, duration, description, id]
    );

    connection.release();
    res.json({ message: 'Experience updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM experience WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

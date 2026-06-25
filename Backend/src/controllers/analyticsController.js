import pool from '../config/database.js';

export const getAllAnalytics = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [analytics] = await connection.query('SELECT * FROM analytics ORDER BY id DESC');
    connection.release();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalyticsById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [analytics] = await connection.query('SELECT * FROM analytics WHERE id = ?', [id]);
    connection.release();

    if (analytics.length === 0) return res.status(404).json({ message: 'Metric not found' });
    res.json(analytics[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnalytics = async (req, res) => {
  try {
    const { metric_key, metric_value, description } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO analytics (metric_key, metric_value, description) VALUES (?, ?, ?)',
      [metric_key, metric_value, description]
    );
    connection.release();
    res.status(201).json({ message: 'Analytics metric created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { metric_key, metric_value, description } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE analytics SET metric_key = ?, metric_value = ?, description = ? WHERE id = ?',
      [metric_key, metric_value, description, id]
    );
    connection.release();
    res.json({ message: 'Analytics metric updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM analytics WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Analytics metric deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
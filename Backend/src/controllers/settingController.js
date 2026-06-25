import pool from '../config/database.js';

const parseMetadata = (setting) => {
  if (!setting?.metadata) return null;
  try {
    return JSON.parse(setting.metadata);
  } catch {
    return setting.metadata;
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [settings] = await connection.query('SELECT * FROM settings ORDER BY id DESC');
    connection.release();
    res.json(settings.map((item) => ({ ...item, metadata: parseMetadata(item) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const connection = await pool.getConnection();
    const [settings] = await connection.query('SELECT * FROM settings WHERE setting_key = ?', [key]);
    connection.release();
    if (settings.length === 0) return res.status(404).json({ message: 'Setting not found' });
    const setting = settings[0];
    res.json({ ...setting, metadata: parseMetadata(setting) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSetting = async (req, res) => {
  try {
    const { setting_key, value, metadata } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO settings (setting_key, value, metadata) VALUES (?, ?, ?)',
      [setting_key, value, metadata ? JSON.stringify(metadata) : null]
    );
    connection.release();
    res.status(201).json({ message: 'Setting created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, metadata } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE settings SET value = ?, metadata = ? WHERE setting_key = ?',
      [value, metadata ? JSON.stringify(metadata) : null, key]
    );
    connection.release();
    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM settings WHERE setting_key = ?', [key]);
    connection.release();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
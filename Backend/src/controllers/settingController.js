import pool from '../config/database.js';

const parseMetadata = (setting) => {
  if (!setting?.metadata) return null;
  try {
    return JSON.parse(setting.metadata);
  } catch {
    return setting.metadata;
  }
};

const ensureSettingsReady = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      value TEXT DEFAULT NULL,
      metadata JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [metadataColumn] = await connection.query('SHOW COLUMNS FROM settings LIKE ?', ['metadata']);
  if (metadataColumn.length === 0) {
    await connection.query('ALTER TABLE settings ADD COLUMN metadata JSON DEFAULT NULL');
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureSettingsReady(connection);
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
    await ensureSettingsReady(connection);
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
    await ensureSettingsReady(connection);
    await connection.query(
      `INSERT INTO settings (setting_key, value, metadata) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value), metadata = VALUES(metadata)`,
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
    await ensureSettingsReady(connection);
    await connection.query(
      `INSERT INTO settings (setting_key, value, metadata) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value), metadata = VALUES(metadata)`,
      [key, value, metadata ? JSON.stringify(metadata) : null]
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
    await ensureSettingsReady(connection);
    await connection.query('DELETE FROM settings WHERE setting_key = ?', [key]);
    connection.release();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

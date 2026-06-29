import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const ensureAdminsReady = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

export const getAllUsers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureAdminsReady(connection);
    const [users] = await connection.query('SELECT id, email, created_at FROM admins ORDER BY id DESC');
    connection.release();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const connection = await pool.getConnection();
    await ensureAdminsReady(connection);
    const [existing] = await connection.query('SELECT COUNT(*) as cnt FROM admins WHERE email = ?', [email]);
    if (existing[0].cnt > 0) {
      connection.release();
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await connection.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
    connection.release();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    await ensureAdminsReady(connection);
    const values = [];
    const updates = [];
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'No update fields provided' });
    }
    values.push(id);
    await connection.query(`UPDATE admins SET ${updates.join(', ')} WHERE id = ?`, values);
    connection.release();
    res.json({ message: 'Admin user updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await ensureAdminsReady(connection);
    await connection.query('DELETE FROM admins WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

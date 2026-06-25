import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM admins WHERE email = ?', [email]);
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, email: admin.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const seedAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();
    const [existing] = await connection.query('SELECT COUNT(*) as cnt FROM admins');
    const count = existing[0]?.cnt || 0;
    if (count > 0) {
      connection.release();
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await connection.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
    connection.release();

    res.status(201).json({ message: 'Admin seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

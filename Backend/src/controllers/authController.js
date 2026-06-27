import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Router } from 'express';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const router = Router();

export const loginAdmin = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password ?? '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? LIMIT 1', [email]);
    let admin = rows[0];

    console.log('Login attempt email:', email);
    console.log('Admin found:', !!admin);

    if (!admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
      admin = { id: result.insertId, email, password: hashedPassword };
      console.log('Created admin during login for:', email);
    }

    const storedPassword = admin?.password || '';
    const isMatch = storedPassword.startsWith('$2')
      ? await bcrypt.compare(password, storedPassword)
      : storedPassword === password;

    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-key';
    const token = jwt.sign({ id: admin.id, email: admin.email }, secret, { expiresIn: '1h' });

    return res.json({ success: true, message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = loginAdmin;

export const seedAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || process.env.ADMIN_EMAIL || 'admin@example.com');
    const password = String(req.body?.password || process.env.ADMIN_PASSWORD || 'adminpassword');
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM admins WHERE email = ?', [email]);

    if (rows[0].count === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
      console.log('Default admin user created via seed endpoint.');
      return res.status(201).json({ message: 'Default admin user created.' });
    }

    return res.status(200).json({ message: 'Admin user already exists.' });
  } catch (error) {
    console.error('Seed admin error:', error.message);
    return res.status(500).json({ message: 'Server error during admin seeding.' });
  }
};

router.get('/test', (req, res) => {
  res.json({ success: true, route: 'auth working' });
});

router.post('/login', loginAdmin);
router.post('/seed', seedAdmin);

export default router;

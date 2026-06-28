import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

console.log('AUTH CONTROLLER LOADED', import.meta.url);

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

export const loginAdmin = async (req, res) => {
  try {
    console.log('===== LOGIN START =====');
    console.log('BODY:', req.body);

    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = String(password ?? '');

    console.log('EMAIL:', normalizedEmail);
    console.log('PASSWORD PROVIDED:', Boolean(normalizedPassword));

    if (!normalizedEmail || !normalizedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM admins WHERE email = ?',
      [normalizedEmail]
    );

    console.log('USERS:', users);

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const admin = users[0];
    console.log('PASSWORD HASH:', admin.password);

    const valid = await bcrypt.compare(normalizedPassword, admin.password);
    console.log('PASSWORD VALID:', valid);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    console.log('JWT SECRET SET:', Boolean(JWT_SECRET));

    if (!JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        stack: 'Missing JWT_SECRET'
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('LOGIN SUCCESSFUL for:', normalizedEmail);
    return res.json({ success: true, message: 'Login successful', token });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

export const login = loginAdmin;

export const seedAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(
      req.body?.email || process.env.ADMIN_EMAIL || 'admin@example.com'
    );
    const password = String(
      req.body?.password || process.env.ADMIN_PASSWORD || 'adminpassword'
    );

    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM admins WHERE email = ?',
      [email]
    );

    if (rows[0].count === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO admins (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );
      console.log('Default admin user created via seed endpoint.');
      return res.status(201).json({ success: true, message: 'Default admin user created.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin user already exists.'
    });
  } catch (error) {
    console.error('SEED ADMIN ERROR:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

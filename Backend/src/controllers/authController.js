import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

export const loginAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

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
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ success: false, error: 'Server configuration error', stack: 'Missing JWT_SECRET' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ success: true, message: 'Login successful', token });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ success: false, error: error.message, stack: error.stack });
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
      return res.status(201).json({ success: true, message: 'Default admin user created.' });
    }

    return res.status(200).json({ success: true, message: 'Admin user already exists.' });
  } catch (error) {
    console.error('SEED ADMIN ERROR:', error);
    return res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
};

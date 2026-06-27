import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    const admin = rows[0];

    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const seedAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admins');
    if (rows[0].count === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query('INSERT INTO admins (email, password) VALUES (?, ?)', [adminEmail, hashedPassword]);
      console.log('Default admin user created via seed endpoint.');
      return res.status(201).json({ message: 'Default admin user created.' });
    } else {
      return res.status(200).json({ message: 'Admin user already exists.' });
    }
  } catch (error) {
    console.error('Seed admin error:', error.message);
    res.status(500).json({ message: 'Server error during admin seeding.' });
  }
};
    await connection.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);
    connection.release();

    res.status(201).json({ message: 'Admin seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

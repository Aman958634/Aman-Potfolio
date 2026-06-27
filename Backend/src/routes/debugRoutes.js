import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const router = express.Router();

router.get('/admins', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, created_at FROM admins ORDER BY id ASC');
    return res.json(rows);
  } catch (error) {
    console.error('Debug admins error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch admins' });
  }
});

router.post('/create-admin', async (req, res) => {
  try {
    const email = 'admin@prestige.com';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('DELETE FROM admins');
    await pool.query('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hashedPassword]);

    return res.json({
      success: true,
      message: 'Admin recreated successfully',
      email,
    });
  } catch (error) {
    console.error('Create admin debug error:', error.message);
    return res.status(500).json({ message: 'Failed to create admin' });
  }
});

export default router;

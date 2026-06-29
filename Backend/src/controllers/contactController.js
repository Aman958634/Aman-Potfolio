import nodemailer from 'nodemailer';
import pool from '../config/database.js';

const getContactRecipient = () => process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || 'anovatechnologies5@gmail.com';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const ensureContactsReady = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const createTransporter = () => {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const submitContact = async (req, res) => {
  let connection;
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    connection = await pool.getConnection();
    await ensureContactsReady(connection);

    await connection.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    const transporter = createTransporter();
    let emailDelivered = false;

    if (!transporter) {
      console.warn('SMTP_USER/SMTP_PASS not configured; contact message saved to DB only.');
      return res.status(503).json({
        message: 'Message saved, but email is not configured. Set SMTP_USER and SMTP_PASS in Railway.',
        emailDelivered,
        emailConfigured: false,
      });
    }

    try {
      await transporter.verify();
      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
        to: getContactRecipient(),
        replyTo: email,
        subject: `New portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
            <h2 style="margin-bottom: 12px;">New Portfolio Contact Message</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">${escapeHtml(message)}</p>
          </div>
        `,
      });
      emailDelivered = true;
    } catch (mailError) {
      console.error('Email delivery failed after saving contact:', mailError);
      return res.status(502).json({
        message: 'Message saved, but Gmail delivery failed. Check SMTP_USER, SMTP_PASS app password, and CONTACT_TO_EMAIL in Railway.',
        emailDelivered,
        emailConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
        error: mailError.code || mailError.responseCode || mailError.message,
      });
    }

    return res.status(201).json({
      message: 'Message sent successfully. I will get back to you soon!',
      emailDelivered,
      emailConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureContactsReady(connection);
    const [contacts] = await connection.query('SELECT * FROM contacts ORDER BY created_at DESC');
    connection.release();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM contacts WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

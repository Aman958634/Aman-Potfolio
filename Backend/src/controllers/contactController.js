import nodemailer from 'nodemailer';
import pool from '../config/database.js';

const contactRecipient = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || 'anovatechnologies5@gmail.com';

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    requireTLS: true,
    authMethod: 'LOGIN',
    auth: {
      user,
      pass,
    },
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

    await connection.query(
      'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    const transporter = createTransporter();
    let emailDelivered = false;

    if (transporter) {
      try {
        await transporter.verify();
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: contactRecipient,
          replyTo: email,
          subject: `New portfolio message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <h2 style="margin-bottom: 12px;">New Portfolio Contact Message</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">${message}</p>
            </div>
          `,
        });
        emailDelivered = true;
      } catch (mailError) {
        console.error('Email delivery failed after saving contact:', mailError);
      }
    } else {
      console.warn('SMTP_USER/SMTP_PASS not configured; contact message saved to DB only.');
    }

    return res.status(201).json({
      message: emailDelivered
        ? 'Message sent successfully. I will get back to you soon!'
        : 'Message saved successfully. Email delivery is temporarily unavailable.',
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

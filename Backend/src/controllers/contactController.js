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
      phone VARCHAR(50) DEFAULT NULL,
      subject VARCHAR(200) DEFAULT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const requiredColumns = [
    ['phone', 'VARCHAR(50) DEFAULT NULL'],
    ['subject', 'VARCHAR(200) DEFAULT NULL'],
  ];

  for (const [columnName, definition] of requiredColumns) {
    const [columns] = await connection.query('SHOW COLUMNS FROM contacts LIKE ?', [columnName]);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE contacts ADD COLUMN ${columnName} ${definition}`);
    }
  }
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

const getEmailConfigStatus = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT || 587) === 465,
  user: process.env.SMTP_USER || '',
  recipient: getContactRecipient(),
  hasPassword: Boolean(process.env.SMTP_PASS),
});

const sendPortfolioEmail = async ({ name, email, phone = '', subject = 'Project inquiry', message, to }) => {
  const transporter = createTransporter();

  if (!transporter) {
    const error = new Error('SMTP_USER and SMTP_PASS are required');
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }

  await transporter.verify();

  const emailSubject = subject?.trim() || 'Project inquiry';
  const fromName = process.env.SMTP_FROM_NAME || 'Anova Technologies';

  return transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    sender: process.env.SMTP_USER,
    to: to || getContactRecipient(),
    replyTo: email,
    subject: `New Contact Message: ${emailSubject}`,
    text: [
      'New contact message',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Subject: ${emailSubject}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.65;">
        <h2 style="margin: 0 0 18px; color: #1d4ed8; font-size: 22px;">New contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></p>
        <p><strong>Phone:</strong> ${escapeHtml(phone || 'Not provided')}</p>
        <p><strong>Subject:</strong> ${escapeHtml(emailSubject)}</p>
        <p style="margin-top: 22px;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
      </div>
    `,
  });
};

export const submitContact = async (req, res) => {
  let connection;
  try {
    const {
      name,
      email,
      phone = '',
      subject = 'Project inquiry',
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedPhone = String(phone || '').trim();
    const normalizedSubject = String(subject || '').trim() || 'Project inquiry';

    connection = await pool.getConnection();
    await ensureContactsReady(connection);

    await connection.query(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, normalizedPhone, normalizedSubject, message]
    );

    let emailDelivered = false;

    try {
      await sendPortfolioEmail({ name, email, phone: normalizedPhone, subject: normalizedSubject, message });
      emailDelivered = true;
    } catch (mailError) {
      console.error('Email delivery failed after saving contact:', mailError);
      return res.status(201).json({
        message: 'Message saved successfully. Gmail delivery needs SMTP settings checked.',
        emailDelivered,
        emailConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
        emailConfig: getEmailConfigStatus(),
        warning: mailError.code === 'SMTP_NOT_CONFIGURED'
          ? 'Set SMTP_USER and SMTP_PASS in Railway to send Gmail notifications.'
          : 'Check SMTP_USER, SMTP_PASS app password, and CONTACT_TO_EMAIL in Railway.',
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

export const testEmail = async (req, res) => {
  try {
    const to = req.body?.to || getContactRecipient();
    const info = await sendPortfolioEmail({
      name: 'Portfolio SMTP Test',
      email: process.env.SMTP_USER || to,
      phone: 'SMTP test',
      subject: 'Gmail delivery test',
      message: `This is a test email from your portfolio backend. Sent at ${new Date().toISOString()}.`,
      to,
    });

    res.json({
      success: true,
      message: 'Test email sent successfully.',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      emailConfig: getEmailConfigStatus(),
    });
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(error.code === 'SMTP_NOT_CONFIGURED' ? 503 : 502).json({
      success: false,
      message: error.code === 'SMTP_NOT_CONFIGURED'
        ? 'Email is not configured. Set SMTP_USER and SMTP_PASS in Railway.'
        : 'Gmail test failed. Check SMTP_USER, SMTP_PASS app password, and CONTACT_TO_EMAIL in Railway.',
      error: error.code || error.responseCode || error.message,
      emailConfig: getEmailConfigStatus(),
    });
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

import nodemailer from 'nodemailer';
import pool from '../config/database.js';

const getEnvValue = (...keys) => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  return '';
};

const getSmtpConfig = () => {
  const user = getEnvValue('SMTP_USER', 'EMAIL_USER', 'GMAIL_USER', 'MAIL_USER');
  const pass = getEnvValue('SMTP_PASS', 'EMAIL_PASS', 'GMAIL_PASS', 'MAIL_PASS');
  const host = getEnvValue('SMTP_HOST', 'EMAIL_HOST', 'MAIL_HOST') || 'smtp.gmail.com';
  const isGmail = host.toLowerCase() === 'smtp.gmail.com';
  const port = isGmail ? 465 : Number(getEnvValue('SMTP_PORT', 'EMAIL_PORT', 'MAIL_PORT') || 587);
  const secure = isGmail || String(getEnvValue('SMTP_SECURE', 'EMAIL_SECURE', 'MAIL_SECURE')).toLowerCase() === 'true' || port === 465;

  return {
    user,
    pass,
    host,
    port,
    secure,
    fromName: getEnvValue('SMTP_FROM_NAME', 'EMAIL_FROM_NAME', 'MAIL_FROM_NAME') || 'Anova Technologies',
  };
};

const EMAIL_RETRY_DELAYS_MS = [0, 3000, 10000];
let contactsSchemaReady = false;

const getContactRecipient = () => {
  const smtp = getSmtpConfig();
  return getEnvValue('CONTACT_TO_EMAIL', 'TO_EMAIL', 'ADMIN_EMAIL', 'RECEIVER_EMAIL') || smtp.user || 'anovatechnologies5@gmail.com';
};

const ensureContactsReady = async (connection) => {
  if (contactsSchemaReady) {
    return;
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      subject VARCHAR(200) DEFAULT NULL,
      message TEXT NOT NULL,
      email_status VARCHAR(20) DEFAULT 'queued',
      email_error TEXT DEFAULT NULL,
      email_sent_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const requiredColumns = [
    ['phone', 'VARCHAR(50) DEFAULT NULL'],
    ['subject', 'VARCHAR(200) DEFAULT NULL'],
    ['email_status', "VARCHAR(20) DEFAULT 'queued'"],
    ['email_error', 'TEXT DEFAULT NULL'],
    ['email_sent_at', 'TIMESTAMP NULL DEFAULT NULL'],
  ];

  for (const [columnName, definition] of requiredColumns) {
    const [columns] = await connection.query('SHOW COLUMNS FROM contacts LIKE ?', [columnName]);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE contacts ADD COLUMN ${columnName} ${definition}`);
    }
  }

  contactsSchemaReady = true;
};

const createTransporter = () => {
  const smtp = getSmtpConfig();

  if (!smtp.user || !smtp.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const getEmailConfigStatus = () => {
  const smtp = getSmtpConfig();

  return {
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    user: smtp.user,
    recipient: getContactRecipient(),
    hasPassword: Boolean(smtp.pass),
    configured: Boolean(smtp.user && smtp.pass),
    acceptedVariableNames: {
      user: ['SMTP_USER', 'EMAIL_USER', 'GMAIL_USER', 'MAIL_USER'],
      pass: ['SMTP_PASS', 'EMAIL_PASS', 'GMAIL_PASS', 'MAIL_PASS'],
      recipient: ['CONTACT_TO_EMAIL', 'TO_EMAIL', 'ADMIN_EMAIL', 'RECEIVER_EMAIL'],
    },
    missing: [
      !smtp.user ? 'SMTP_USER' : null,
      !smtp.pass ? 'SMTP_PASS' : null,
    ].filter(Boolean),
  };
};

const getSavedContact = async (contactId) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await ensureContactsReady(connection);

    const [contacts] = await connection.query(
      `SELECT id, name, email, phone, subject, message, email_status, email_error, email_sent_at, created_at
       FROM contacts
       WHERE id = ?
       LIMIT 1`,
      [contactId]
    );

    return contacts[0] || null;
  } finally {
    if (connection) connection.release();
  }
};

const sendPortfolioEmail = async ({
  contactId,
  name,
  email,
  phone = '',
  subject = '',
  message,
  to,
}) => {
  const transporter = createTransporter();

  if (!transporter) {
    const error = new Error('Gmail is not configured. Add SMTP_USER and SMTP_PASS in Railway Variables.');
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }

  const emailSubject = subject || 'Portfolio contact message';
  const smtp = getSmtpConfig();
  const formName = String(name ?? '');
  const formEmail = String(email ?? '');
  const formPhone = String(phone ?? '');
  const formSubject = String(subject ?? '');
  const formMessage = String(message ?? '');
  const replyEmail = formEmail.trim();

  const info = await transporter.sendMail({
    from: `"${smtp.fromName}" <${smtp.user}>`,
    sender: smtp.user,
    to: to || getContactRecipient(),
    replyTo: replyEmail.includes('@') ? replyEmail : undefined,
    subject: emailSubject,
    text: [
      `Name: ${formName}`,
      `Email: ${formEmail}`,
      `Phone: ${formPhone}`,
      `Subject: ${formSubject}`,
      '',
      'Message:',
      formMessage,
    ].join('\n'),
  });

  if (info.rejected?.length) {
    const error = new Error(`Gmail rejected recipient(s): ${info.rejected.join(', ')}`);
    error.code = 'SMTP_RECIPIENT_REJECTED';
    throw error;
  }

  return info;
};

const wait = (delayMs) => new Promise((resolve) => {
  if (delayMs <= 0) {
    resolve();
    return;
  }

  setTimeout(resolve, delayMs);
});

const updateContactEmailStatus = async (contactId, status, error = null) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await ensureContactsReady(connection);
    await connection.query(
      `UPDATE contacts
       SET email_status = ?, email_error = ?, email_sent_at = ${status === 'sent' ? 'CURRENT_TIMESTAMP' : 'NULL'}
       WHERE id = ?`,
      [status, error ? String(error).slice(0, 1000) : null, contactId]
    );
  } catch (statusError) {
    console.error('Unable to update contact email status:', statusError);
  } finally {
    if (connection) connection.release();
  }
};

const mapContactRowToEmailPayload = (contact) => ({
  contactId: contact.id,
  name: contact.name,
  email: contact.email,
  phone: contact.phone,
  subject: contact.subject,
  message: contact.message,
  savedAt: contact.created_at,
  submittedAt: contact.created_at,
});

const sendContactEmailWithRetry = async (contactId, fallbackPayload) => {
  let lastError = null;

  for (let attempt = 0; attempt < EMAIL_RETRY_DELAYS_MS.length; attempt += 1) {
    await wait(EMAIL_RETRY_DELAYS_MS[attempt]);

    try {
      const savedContact = await getSavedContact(contactId);
      const emailPayload = savedContact
        ? mapContactRowToEmailPayload(savedContact)
        : fallbackPayload;
      const info = await sendPortfolioEmail(emailPayload);

      console.log('Contact Gmail delivered:', {
        contactId,
        messageId: info.messageId,
        accepted: info.accepted,
        attempt: attempt + 1,
      });

      await updateContactEmailStatus(contactId, 'sent');
      return info;
    } catch (error) {
      lastError = error;
      console.error(`Contact Gmail delivery attempt ${attempt + 1} failed:`, error.code || error.responseCode || error.message);
    }
  }

  await updateContactEmailStatus(contactId, 'failed', lastError?.code || lastError?.responseCode || lastError?.message || 'Unknown email error');
  throw lastError;
};

const sendContactEmailInBackground = (contactId, fallbackPayload) => {
  void sendContactEmailWithRetry(contactId, fallbackPayload).catch((error) => {
    console.error('Contact Gmail background delivery failed:', {
      contactId,
      error: error?.code || error?.responseCode || error?.message || 'Unknown email error',
    });
  });
};

export const submitContact = async (req, res) => {
  let connection;

  try {
    const {
      name,
      email,
      phone = '',
      subject = '',
      message,
    } = req.body;

    const formName = String(name ?? '');
    const formEmail = String(email ?? '');
    const formMessage = String(message ?? '');
    const formPhone = String(phone ?? '');
    const formSubject = String(subject ?? '');
    const emailForValidation = formEmail.trim();

    if (!formName.trim() || !emailForValidation || !formMessage.trim()) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailForValidation)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    connection = await pool.getConnection();
    await ensureContactsReady(connection);

    const [result] = await connection.query(
      'INSERT INTO contacts (name, email, phone, subject, message, email_status) VALUES (?, ?, ?, ?, ?, ?)',
      [formName, formEmail, formPhone, formSubject, formMessage, 'queued']
    );

    const contactId = result.insertId;

    if (connection) {
      connection.release();
      connection = null;
    }

    sendContactEmailInBackground(contactId, {
      contactId,
      name: formName,
      email: formEmail,
      phone: formPhone,
      subject: formSubject,
      message: formMessage,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Message saved successfully. Gmail notification is being sent.',
      saved: true,
      contactId,
      emailQueued: true,
      emailDelivered: false,
      emailConfigured: getEmailConfigStatus().configured,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: error.code || error.responseCode || error.message,
      saved: false,
      emailDelivered: false,
      emailConfigured: getEmailConfigStatus().configured,
    });
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
    const smtp = getSmtpConfig();
    const info = await sendPortfolioEmail({
      name: 'Portfolio SMTP Test',
      email: smtp.user || to,
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
        ? 'Email is not configured. Add SMTP_USER and SMTP_PASS in Railway Variables, then redeploy.'
        : 'Gmail test failed. Check SMTP_USER, SMTP_PASS Gmail app password, and CONTACT_TO_EMAIL in Railway.',
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

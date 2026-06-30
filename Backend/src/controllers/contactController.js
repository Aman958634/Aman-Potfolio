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
  const explicitPort = getEnvValue('SMTP_PORT', 'EMAIL_PORT', 'MAIL_PORT');
  const explicitSecure = getEnvValue('SMTP_SECURE', 'EMAIL_SECURE', 'MAIL_SECURE');
  const port = Number(explicitPort || (isGmail ? 587 : 587));
  const secure = explicitSecure
    ? String(explicitSecure).toLowerCase() === 'true'
    : port === 465;

  return {
    user,
    pass,
    host,
    port,
    secure,
    fromName: getEnvValue('SMTP_FROM_NAME', 'EMAIL_FROM_NAME', 'MAIL_FROM_NAME') || 'Anova Technologies',
  };
};

const EMAIL_RETRY_DELAYS_MS = [0, 1000, 3000];
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

const createTransporter = (overrides = {}) => {
  const smtp = getSmtpConfig();

  if (!smtp.user || !smtp.pass) {
    return null;
  }

  const port = Number(overrides.port || smtp.port);
  const secure = typeof overrides.secure === 'boolean' ? overrides.secure : smtp.secure;

  return nodemailer.createTransport({
    host: smtp.host,
    port,
    secure,
    requireTLS: port === 587,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const getSmtpSendOptions = () => {
  const smtp = getSmtpConfig();
  const options = [{ port: smtp.port, secure: smtp.secure }];

  if (smtp.host.toLowerCase() === 'smtp.gmail.com') {
    const fallback = smtp.port === 465
      ? { port: 587, secure: false }
      : { port: 465, secure: true };

    if (!options.some((option) => option.port === fallback.port)) {
      options.push(fallback);
    }
  }

  return options;
};

const formatContactDate = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const normalizeContactEmailPayload = ({
  contactId,
  name,
  email,
  phone = '',
  subject = '',
  message,
  savedAt,
  submittedAt,
}) => {
  const values = {
    contactId: contactId ? String(contactId) : '',
    name: String(name ?? ''),
    email: String(email ?? ''),
    phone: String(phone ?? ''),
    subject: String(subject ?? ''),
    message: String(message ?? ''),
    submittedAt: formatContactDate(submittedAt || savedAt),
  };

  return {
    ...values,
    replyEmail: values.email.trim(),
    displayPhone: values.phone || 'Not provided',
    displaySubject: values.subject || 'Project inquiry',
  };
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sanitizeHeaderValue = (value) => String(value ?? '')
  .replace(/[\r\n]+/g, ' ')
  .trim();

const buildContactEmailContent = (contact) => {
  const data = normalizeContactEmailPayload(contact);
  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.displayPhone],
    ['Subject', data.displaySubject],
  ];

  if (data.contactId) rows.unshift(['Admin Message ID', data.contactId]);
  if (data.submittedAt) rows.push(['Submitted At', data.submittedAt]);

  const text = [
    'New contact form message - form details',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    data.message,
  ].join('\n');

  const detailRowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;font-weight:700;width:160px;">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(value)}</td>
    </tr>
  `).join('');

  const detailsHtml = rows.map(([label, value]) => `
    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#0f172a;">
      <strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}
    </p>
  `).join('');

  const html = `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="padding:20px 24px;background:#0f172a;color:#ffffff;">
          <h1 style="margin:0;font-size:20px;line-height:1.35;">New contact form message</h1>
          <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">All submitted form values are shown below.</p>
        </div>
        <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;background:#ffffff;">
          <h2 style="margin:0 0 14px;font-size:16px;line-height:1.4;color:#0f172a;">Form Details</h2>
          ${detailsHtml}
        </div>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
          ${detailRowsHtml}
        </table>
        <div style="padding:20px 24px;">
          <div style="margin:0 0 10px;color:#475569;font-weight:700;">Message</div>
          <div style="white-space:pre-wrap;line-height:1.6;color:#0f172a;">${escapeHtml(data.message)}</div>
        </div>
      </div>
    </div>
  `;

  return {
    data,
    text,
    html,
  };
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
  savedAt,
  submittedAt,
  to,
}) => {
  const smtp = getSmtpConfig();

  if (!smtp.user || !smtp.pass) {
    const error = new Error('Gmail is not configured. Add SMTP_USER and SMTP_PASS in Railway Variables.');
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }

  const cleanSubject = sanitizeHeaderValue(subject);
  const cleanName = sanitizeHeaderValue(name);
  const emailSubject = cleanSubject
    ? `New contact from ${cleanName || 'Portfolio'}: ${cleanSubject}`
    : `New contact from ${cleanName || 'Portfolio'}`;
  const { data, text, html } = buildContactEmailContent({
    contactId,
    name,
    email,
    phone,
    subject,
    message,
    savedAt,
    submittedAt,
  });

  let lastError = null;

  for (const sendOption of getSmtpSendOptions()) {
    try {
      const transporter = createTransporter(sendOption);
      const info = await transporter.sendMail({
        from: `"${smtp.fromName}" <${smtp.user}>`,
        sender: smtp.user,
        to: to || getContactRecipient(),
        replyTo: data.replyEmail.includes('@') ? sanitizeHeaderValue(data.replyEmail) : undefined,
        subject: emailSubject,
        text,
        html,
      });

      if (info.rejected?.length) {
        const error = new Error(`Gmail rejected recipient(s): ${info.rejected.join(', ')}`);
        error.code = 'SMTP_RECIPIENT_REJECTED';
        throw error;
      }

      return info;
    } catch (error) {
      lastError = error;
      console.error('Gmail send failed on SMTP option:', {
        port: sendOption.port,
        secure: sendOption.secure,
        error: getEmailErrorMessage(error),
      });
    }
  }

  throw lastError;
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

const sendContactEmailWithRetry = async (contactId) => {
  let lastError = null;
  await updateContactEmailStatus(contactId, 'sending');

  for (let attempt = 0; attempt < EMAIL_RETRY_DELAYS_MS.length; attempt += 1) {
    await wait(EMAIL_RETRY_DELAYS_MS[attempt]);

    try {
      const savedContact = await getSavedContact(contactId);
      if (!savedContact) {
        throw new Error(`Saved contact row not found for id ${contactId}`);
      }

      const info = await sendPortfolioEmail(mapContactRowToEmailPayload(savedContact));

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

const queueContactEmailDelivery = (contactId) => {
  void sendContactEmailWithRetry(contactId).catch((error) => {
    console.error('Background Gmail delivery failed:', {
      contactId,
      error: getEmailErrorMessage(error),
    });
  });
};

const getEmailErrorMessage = (error) => (
  error?.code || error?.responseCode || error?.message || 'Unknown email error'
);

const getEmailFailureHelp = (error) => {
  if (error?.code === 'SMTP_NOT_CONFIGURED') {
    return 'Add SMTP_USER and SMTP_PASS in Railway Variables, then redeploy.';
  }

  if (error?.code === 'EAUTH' || error?.responseCode === 535) {
    return 'Gmail login failed. Use a Gmail app password in SMTP_PASS, not the normal Gmail password.';
  }

  if (error?.code === 'SMTP_RECIPIENT_REJECTED') {
    return 'Gmail rejected the receiver email. Check CONTACT_TO_EMAIL.';
  }

  if (['ESOCKET', 'ETIMEDOUT', 'ECONNECTION'].includes(error?.code)) {
    return 'SMTP socket connection failed. Keep SMTP_HOST=smtp.gmail.com, set SMTP_PORT=587, SMTP_SECURE=false in Railway Variables, then redeploy.';
  }

  return 'Check SMTP_USER, SMTP_PASS Gmail app password, CONTACT_TO_EMAIL, and Railway deploy logs.';
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

    queueContactEmailDelivery(contactId);

    return res.status(201).json({
      message: 'Message saved successfully. Gmail notification is sending.',
      saved: true,
      contactId,
      emailQueued: true,
      emailDelivered: false,
      emailConfigured: getEmailConfigStatus().configured,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: getEmailErrorMessage(error),
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

    contacts
      .filter((contact) => !['sent', 'failed', 'sending'].includes(String(contact.email_status || 'queued')))
      .slice(0, 5)
      .forEach((contact) => queueContactEmailDelivery(contact.id));

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
      error: getEmailErrorMessage(error),
      emailHelp: getEmailFailureHelp(error),
      emailConfig: getEmailConfigStatus(),
    });
  }
};

export const resendContactEmail = async (req, res) => {
  const { id } = req.params;

  try {
    const info = await sendContactEmailWithRetry(id);

    res.json({
      success: true,
      message: 'Saved message sent to Gmail successfully.',
      contactId: id,
      emailDelivered: true,
      messageId: info.messageId,
      accepted: info.accepted,
    });
  } catch (error) {
    res.status(error.code === 'SMTP_NOT_CONFIGURED' ? 503 : 502).json({
      success: false,
      message: 'Saved message could not be sent to Gmail.',
      contactId: id,
      emailDelivered: false,
      error: getEmailErrorMessage(error),
      emailHelp: getEmailFailureHelp(error),
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

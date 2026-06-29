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

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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

const sendPortfolioEmail = async ({
  contactId,
  name,
  email,
  phone = '',
  subject = 'Project inquiry',
  message,
  submittedAt = new Date(),
  to,
}) => {
  const transporter = createTransporter();

  if (!transporter) {
    const error = new Error('Gmail is not configured. Add SMTP_USER and SMTP_PASS in Railway Variables.');
    error.code = 'SMTP_NOT_CONFIGURED';
    throw error;
  }

  const emailSubject = subject?.trim() || 'Project inquiry';
  const smtp = getSmtpConfig();
  const safeName = name?.trim() || 'Portfolio Visitor';
  const safeEmail = email?.trim() || 'No email provided';
  const safePhone = phone?.trim() || 'Not provided';
  const safeMessage = message?.trim() || 'No message provided';
  const submittedDate = new Date(submittedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
  const replyHref = safeEmail.includes('@') ? `mailto:${safeEmail}?subject=Re: ${encodeURIComponent(emailSubject)}` : '';

  const info = await transporter.sendMail({
    from: `"${smtp.fromName}" <${smtp.user}>`,
    sender: smtp.user,
    to: to || getContactRecipient(),
    replyTo: safeEmail.includes('@') ? safeEmail : undefined,
    subject: `Portfolio Contact: ${emailSubject} - ${safeName}`,
    text: [
      'New portfolio contact message',
      '',
      `Contact ID: ${contactId || 'N/A'}`,
      `Submitted: ${submittedDate}`,
      `Name: ${safeName}`,
      `Email: ${safeEmail}`,
      `Phone: ${safePhone}`,
      `Subject: ${emailSubject}`,
      '',
      'Message:',
      safeMessage,
    ].join('\n'),
    html: `
      <div style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#111827;">
        <div style="max-width:680px;margin:0 auto;padding:28px 18px;">
          <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <div style="background:#2563eb;color:#ffffff;padding:22px 24px;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;">Portfolio Contact Form</p>
              <h2 style="margin:0;font-size:22px;line-height:1.35;">New message from ${escapeHtml(safeName)}</h2>
            </div>
            <div style="padding:24px;">
              <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.6;">
                <tr>
                  <td style="width:130px;padding:10px 0;color:#64748b;font-weight:bold;">Contact ID</td>
                  <td style="padding:10px 0;color:#111827;">${escapeHtml(contactId || 'N/A')}</td>
                </tr>
                <tr>
                  <td style="width:130px;padding:10px 0;color:#64748b;font-weight:bold;">Submitted</td>
                  <td style="padding:10px 0;color:#111827;">${escapeHtml(submittedDate)}</td>
                </tr>
                <tr>
                  <td style="width:130px;padding:10px 0;color:#64748b;font-weight:bold;">Name</td>
                  <td style="padding:10px 0;color:#111827;">${escapeHtml(safeName)}</td>
                </tr>
                <tr>
                  <td style="width:130px;padding:10px 0;color:#64748b;font-weight:bold;">Email</td>
                  <td style="padding:10px 0;color:#111827;">
                    <a href="mailto:${escapeHtml(safeEmail)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(safeEmail)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="width:130px;padding:10px 0;color:#64748b;font-weight:bold;">Phone</td>
                  <td style="padding:10px 0;color:#111827;">${escapeHtml(safePhone)}</td>
                </tr>
                <tr>
                  <td style="width:130px;padding:10px 0;color:#64748b;font-weight:bold;">Subject</td>
                  <td style="padding:10px 0;color:#111827;">${escapeHtml(emailSubject)}</td>
                </tr>
              </table>
              <div style="margin-top:22px;padding:18px;border-radius:12px;background:#f1f5f9;border:1px solid #e2e8f0;">
                <p style="margin:0 0 8px;color:#64748b;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">Message</p>
                <p style="white-space:pre-wrap;margin:0;color:#111827;font-size:16px;line-height:1.7;">${escapeHtml(safeMessage)}</p>
              </div>
              ${replyHref ? `
                <a href="${escapeHtml(replyHref)}" style="display:inline-block;margin-top:22px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:bold;">
                  Reply to ${escapeHtml(safeName)}
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `,
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

const sendContactEmailInBackground = (contactId, payload) => {
  void (async () => {
    let lastError = null;

    for (let attempt = 0; attempt < EMAIL_RETRY_DELAYS_MS.length; attempt += 1) {
      await wait(EMAIL_RETRY_DELAYS_MS[attempt]);

      try {
        const info = await sendPortfolioEmail(payload);
        console.log('Contact Gmail delivered:', {
          contactId,
          messageId: info.messageId,
          accepted: info.accepted,
          attempt: attempt + 1,
        });
        await updateContactEmailStatus(contactId, 'sent');
        return;
      } catch (error) {
        lastError = error;
        console.error(`Contact Gmail delivery attempt ${attempt + 1} failed:`, error.code || error.responseCode || error.message);
      }
    }

    await updateContactEmailStatus(contactId, 'failed', lastError?.code || lastError?.responseCode || lastError?.message || 'Unknown email error');
  })();
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

    const normalizedName = String(name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedMessage = String(message || '').trim();
    const normalizedPhone = String(phone || '').trim();
    const normalizedSubject = String(subject || '').trim() || 'Project inquiry';

    if (!normalizedName || !normalizedEmail || !normalizedMessage) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    connection = await pool.getConnection();
    await ensureContactsReady(connection);

    const [result] = await connection.query(
      'INSERT INTO contacts (name, email, phone, subject, message, email_status) VALUES (?, ?, ?, ?, ?, ?)',
      [normalizedName, normalizedEmail, normalizedPhone, normalizedSubject, normalizedMessage, 'queued']
    );

    const contactId = result.insertId;

    sendContactEmailInBackground(contactId, {
      contactId,
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      subject: normalizedSubject,
      message: normalizedMessage,
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

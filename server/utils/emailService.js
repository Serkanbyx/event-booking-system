const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: { ciphers: 'SSLv3' },
});

/**
 * Sends an email via the configured SMTP transporter.
 * Failures are logged but never thrown — email errors
 * must not break the main application flow.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error(`Email sending failed to ${to}:`, error.message);
    return { success: false };
  }
};

/**
 * Verifies the SMTP connection at startup.
 * Logs a warning instead of crashing when SMTP is not configured
 * (typical in development mode).
 */
const verifyConnection = async () => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn(
      'SMTP credentials not configured — email sending is disabled'
    );
    return;
  }

  try {
    await transporter.verify();
    console.log('SMTP connection verified — email service is ready');
  } catch (error) {
    console.warn('SMTP connection failed:', error.message);
  }
};

module.exports = { sendEmail, verifyConnection };

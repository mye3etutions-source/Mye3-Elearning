const nodemailer = require('nodemailer');

// Create reusable transporter object using the custom SMTP transport
// Requires EMAIL_USER and EMAIL_PASS to be set in .env
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'mail.mye3academy.com',
    port: process.env.EMAIL_PORT || 465,
    secure: process.env.EMAIL_PORT == 587 ? false : true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // do not fail on invalid certs if any
      rejectUnauthorized: false
    }
  });
};

/**
 * Send an email
 * @param {Object} options 
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML string for the email body
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email sending.');
    return;
  }

  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Mye3 e-Tuitions" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw error to prevent app crash if email fails
    return null;
  }
};

module.exports = {
  sendEmail
};

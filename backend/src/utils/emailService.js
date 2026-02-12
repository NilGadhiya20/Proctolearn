import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Send Email Verification
export const sendVerificationEmail = async (email, token, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const htmlTemplate = `
    <h2>Welcome to Proctolearn, ${userName}!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Verify Email
    </a>
    <p>Or copy this link: ${verificationLink}</p>
    <p>This link will expire in 24 hours.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Proctolearn Account',
      html: htmlTemplate
    });

    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send verification email' };
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const htmlTemplate = `
    <h2>Password Reset Request</h2>
    <p>Hi ${userName},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}" style="background-color: #008CBA; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Reset Password
    </a>
    <p>Or copy this link: ${resetLink}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request - Proctolearn',
      html: htmlTemplate
    });

    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send reset email' };
  }
};

// Send Quiz Alert Notification
export const sendQuizAlertEmail = async (email, userName, alertType, details) => {
  const htmlTemplate = `
    <h2>Quiz Alert - Suspicious Activity Detected</h2>
    <p>Hi ${userName},</p>
    <p><strong>Alert Type:</strong> ${alertType}</p>
    <p><strong>Details:</strong> ${details}</p>
    <p>Please review your account for any unauthorized activity.</p>
    <p>If you need assistance, contact your administrator.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Quiz Alert: ${alertType}`,
      html: htmlTemplate
    });

    return { success: true, message: 'Alert email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: 'Failed to send alert email' };
  }
};

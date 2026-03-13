import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Create transporter with improved configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Use TLS with port 587
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  logger: true, // Enable logging
  debug: process.env.NODE_ENV === 'development' // Debug mode in development
});

// Verify SMTP connection at startup with timeout
export const verifyEmailConfig = async () => {
  try {
    // Add a 5-second timeout to prevent server startup from hanging
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email verification timeout')), 5000)
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✓ Email service configured correctly');
    return true;
  } catch (error) {
    console.warn('⚠ Email service configuration warning:', {
      message: error.message,
      code: error.code,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '***' : 'NOT SET'
      }
    });
    console.warn('⚠ Server will start anyway. Email features may not work until configuration is fixed.');
    // Don't fail - allow server to start
    return false;
  }
};

// Send Email Verification
export const sendVerificationEmail = async (email, token, userName) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Proctolearn</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-wrapper { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px; }
        .content { background: white; padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; font-weight: 500; }
        .description { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
        .divider { border-top: 1px solid #eee; margin: 30px 0; }
        .copy-link { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #666; word-break: break-all; font-family: 'Courier New', monospace; }
        .info { font-size: 13px; color: #999; text-align: center; margin-top: 20px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 13px; }
        .footer-link { color: #667eea; text-decoration: none; }
        .icon { font-size: 48px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">📧</div>
            <h1>Welcome to Proctolearn!</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p class="description">
              Thank you for signing up! Your account has been created successfully. To get started, please verify your email address by clicking the button below.
            </p>
            <div class="button-container">
              <a href="${verificationLink}" class="btn">Verify Email Address</a>
            </div>
            <p class="info">Or copy and paste this link in your browser:</p>
            <div class="copy-link">${verificationLink}</div>
            <div class="divider"></div>
            <p style="font-size: 13px; color: #999; margin-bottom: 10px;">
              ⏱️ <strong>This link will expire in 24 hours.</strong>
            </p>
            <p style="font-size: 13px; color: #999;">
              If you didn't create this account, please ignore this email or <a href="mailto:support@proctolearn.com" class="footer-link">contact us</a>.
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <p style="margin: 0;">Questions? <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎓 Verify Your Proctolearn Account',
      html: htmlTemplate
    });

    console.log('Verification email sent successfully:', info.messageId);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    return { success: false, message: 'Failed to send verification email', error: error.message };
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Proctolearn</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-wrapper { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px; }
        .content { background: white; padding: 40px 30px; }
        .greeting { font-size: 18px; color: #333; margin-bottom: 20px; font-weight: 500; }
        .description { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4); }
        .divider { border-top: 1px solid #eee; margin: 30px 0; }
        .copy-link { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #666; word-break: break-all; font-family: 'Courier New', monospace; }
        .info { font-size: 13px; color: #999; text-align: center; margin-top: 20px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #856404; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 13px; }
        .footer-link { color: #f5576c; text-decoration: none; }
        .icon { font-size: 48px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">🔐</div>
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p class="description">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            <div class="button-container">
              <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <p class="info">Or copy and paste this link in your browser:</p>
            <div class="copy-link">${resetLink}</div>
            <div class="divider"></div>
            <p style="font-size: 13px; color: #999; margin-bottom: 10px;">
              ⏱️ <strong>This link will expire in 5 minutes.</strong>
            </p>
            <p style="font-size: 13px; color: #666; margin-bottom: 10px;">
              If you didn't request this password reset, please:
            </p>
            <ul style="font-size: 13px; color: #666; margin: 10px 0; padding-left: 20px;">
              <li>Ignore this email</li>
              <li>Your account is still secure</li>
              <li><a href="mailto:support@proctolearn.com" class="footer-link">Contact support</a> if you have concerns</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <p style="margin: 0;">Questions? <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Reset Your Proctolearn Password',
      html: htmlTemplate
    });

    console.log('Password reset email sent successfully:', info.messageId);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    return { success: false, message: 'Failed to send reset email', error: error.message };
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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Quiz Alert: ${alertType}`,
      html: htmlTemplate
    });

    console.log('Alert email sent successfully:', info.messageId);
    return { success: true, message: 'Alert email sent' };
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    return { success: false, message: 'Failed to send alert email', error: error.message };
  }
};

// Send Welcome Email (After Registration)
export const sendWelcomeEmail = async (email, userName, userRole, institutionName) => {
  const dashboardLink = `${process.env.FRONTEND_URL}/${userRole.toLowerCase()}/dashboard`;
  
  // Role-specific content and emojis
  const roleConfig = {
    student: {
      icon: '🎓',
      gradient: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
      shadowColor: 'rgba(22, 163, 74, 0.3)',
      title: 'Welcome to Your Learning Journey!',
      description: `You're all set to begin your academic journey with Proctolearn. Access your quizzes, track your progress, and excel in your studies!`,
      features: [
        { icon: '📚', title: 'Take Quizzes', desc: 'Access and attempt quizzes assigned by your instructors' },
        { icon: '📊', title: 'Track Progress', desc: 'Monitor your performance and view detailed reports' },
        { icon: '🏆', title: 'Earn Achievements', desc: 'Complete quizzes and unlock badges' },
        { icon: '🎯', title: 'Stay Focused', desc: 'Our proctoring ensures fair and secure assessments' }
      ]
    },
    faculty: {
      icon: '👨‍🏫',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      shadowColor: 'rgba(59, 130, 246, 0.3)',
      title: 'Welcome to the Faculty Portal!',
      description: `Start creating engaging quizzes, monitor student progress, and manage your courses with powerful tools designed for educators.`,
      features: [
        { icon: '✏️', title: 'Create Quizzes', desc: 'Design and customize quizzes with various question types' },
        { icon: '👁️', title: 'Monitor Sessions', desc: 'Real-time proctoring and activity monitoring' },
        { icon: '📈', title: 'View Analytics', desc: 'Comprehensive reports and grade management' },
        { icon: '⚡', title: 'Instant Grading', desc: 'Automated grading with manual review options' }
      ]
    },
    admin: {
      icon: '👑',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      shadowColor: 'rgba(220, 38, 38, 0.3)',
      title: 'Welcome to Admin Control Center!',
      description: `You have full access to manage users, institutions, system settings, and monitor all platform activities.`,
      features: [
        { icon: '👥', title: 'Manage Users', desc: 'Add, edit, and control user permissions' },
        { icon: '🏢', title: 'Institution Control', desc: 'Configure institutions and departments' },
        { icon: '⚙️', title: 'System Settings', desc: 'Customize platform configurations' },
        { icon: '📊', title: 'Global Analytics', desc: 'Comprehensive insights across all activities' }
      ]
    }
  };

  const config = roleConfig[userRole.toLowerCase()] || roleConfig.student;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Proctolearn - ${userName}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f7fa; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .email-wrapper { 
          background: ${config.gradient}; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 40px ${config.shadowColor}; 
        }
        .header { 
          padding: 50px 30px; 
          text-align: center; 
          color: white; 
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .icon { 
          font-size: 64px; 
          margin-bottom: 20px; 
          display: inline-block;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 0.5px; 
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .role-badge {
          display: inline-block;
          background: rgba(255,255,255,0.3);
          padding: 8px 20px;
          border-radius: 20px;
          margin-top: 15px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }
        .content { 
          background: white; 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 20px; 
          color: #1e293b; 
          margin-bottom: 20px; 
          font-weight: 600; 
        }
        .description { 
          color: #64748b; 
          font-size: 15px; 
          line-height: 1.7; 
          margin-bottom: 30px; 
        }
        .info-box {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 4px solid #22c55e;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .info-box-title {
          font-weight: 600;
          color: #166534;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .info-box-text {
          color: #065f46;
          font-size: 14px;
          line-height: 1.6;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 30px 0;
        }
        .feature-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          border-color: #94a3b8;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .feature-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .feature-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .feature-desc {
          color: #64748b;
          font-size: 12px;
          line-height: 1.4;
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0; 
        }
        .btn { 
          display: inline-block; 
          background: ${config.gradient}; 
          color: white; 
          padding: 16px 45px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          box-shadow: 0 4px 15px ${config.shadowColor};
          transition: all 0.3s ease;
        }
        .btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px ${config.shadowColor}; 
        }
        .quick-links {
          background: #f8fafc;
          padding: 25px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .quick-links-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 15px;
          font-size: 16px;
        }
        .link-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .link-item:last-child {
          border-bottom: none;
        }
        .link-item-icon {
          margin-right: 12px;
          font-size: 20px;
        }
        .link-item-text {
          color: #475569;
          font-size: 14px;
          text-decoration: none;
        }
        .divider { 
          border-top: 2px solid #e2e8f0; 
          margin: 30px 0; 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 30px; 
          text-align: center; 
          color: #666; 
          font-size: 13px; 
        }
        .footer-link { 
          color: #3b82f6; 
          text-decoration: none; 
          font-weight: 600;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="header-content">
              <div class="icon">${config.icon}</div>
              <h1>${config.title}</h1>
              <div class="role-badge">${userRole}</div>
            </div>
          </div>
          <div class="content">
            <p class="greeting">Welcome, ${userName}! 🎉</p>
            <p class="description">${config.description}</p>
            
            <div class="info-box">
              <div class="info-box-title">🏢 Your Institution</div>
              <div class="info-box-text">${institutionName}</div>
            </div>

            <div class="features-grid">
              ${config.features.map(feature => `
                <div class="feature-card">
                  <div class="feature-icon">${feature.icon}</div>
                  <div class="feature-title">${feature.title}</div>
                  <div class="feature-desc">${feature.desc}</div>
                </div>
              `).join('')}
            </div>

            <div class="button-container">
              <a href="${dashboardLink}" class="btn">Go to My Dashboard →</a>
            </div>

            <div class="quick-links">
              <div class="quick-links-title">🚀 Quick Start Guide</div>
              <div class="link-item">
                <span class="link-item-icon">1️⃣</span>
                <span class="link-item-text">Complete your profile setup</span>
              </div>
              <div class="link-item">
                <span class="link-item-icon">2️⃣</span>
                <span class="link-item-text">Explore your dashboard features</span>
              </div>
              <div class="link-item">
                <span class="link-item-icon">3️⃣</span>
                <span class="link-item-text">Familiarize yourself with the interface</span>
              </div>
              <div class="link-item">
                <span class="link-item-icon">4️⃣</span>
                <span class="link-item-text">Start using Proctolearn!</span>
              </div>
            </div>

            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 10px;">
              <strong>Need Help?</strong> Our support team is here to assist you 24/7.
            </p>
            <p style="font-size: 13px; color: #64748b; text-align: center;">
              Visit our <a href="${process.env.FRONTEND_URL}/support" class="footer-link">Help Center</a> or 
              <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a>
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 15px 0; font-weight: 600; color: #1e293b;">Proctolearn - Smart Proctoring Platform</p>
          <p style="margin: 0 0 15px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <div class="social-links">
            <a href="#">Twitter</a> • 
            <a href="#">LinkedIn</a> • 
            <a href="#">Facebook</a> • 
            <a href="#">Instagram</a>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8;">
            Questions? <a href="mailto:support@proctolearn.com" class="footer-link">support@proctolearn.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🎉 Welcome to Proctolearn, ${userName}!`,
      html: htmlTemplate
    });

    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    return { success: false, message: 'Failed to send welcome email', error: error.message };
  }
};

// Send New Quiz Announcement Email
export const sendNewQuizEmail = async (email, userName, quizTitle, subject, dueDate, quizLink) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Quiz Available - ${quizTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-wrapper { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3); }
        .header { padding: 40px 30px; text-align: center; color: white; }
        .header .icon { font-size: 48px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { background: white; padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .quiz-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .quiz-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 10px; }
        .quiz-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; color: #64748b; margin: 15px 0; }
        .info-item { display: flex; align-items: center; gap: 8px; }
        .info-label { font-weight: 600; color: #1e293b; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); }
        .divider { border-top: 1px solid #e2e8f0; margin: 30px 0; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 13px; }
        .footer-link { color: #667eea; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">📝</div>
            <h1>New Quiz Available!</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p>A new quiz has been added to your course. Here are the details:</p>
            
            <div class="quiz-card">
              <div class="quiz-title">📚 ${quizTitle}</div>
              <div class="quiz-info">
                <div class="info-item">
                  <span class="info-label">📖 Subject:</span>
                  <span>${subject}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">📅 Due Date:</span>
                  <span>${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              This quiz is now available for you to attempt. Make sure to review the material and complete it before the due date. 
              You can retake the quiz if allowed by your instructor.
            </p>

            <div class="button-container">
              <a href="${quizLink}" class="btn">Start Quiz Now</a>
            </div>

            <div class="divider"></div>

            <p style="color: #64748b; font-size: 14px; margin: 15px 0;">
              <strong>💡 Tip:</strong> Log in regularly to check for new quizzes and announcements from your instructors.
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <p style="margin: 0;">Questions? <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `📝 New Quiz: ${quizTitle}`,
      html: htmlTemplate
    });

    console.log('Quiz announcement email sent successfully:', info.messageId);
    return { success: true, message: 'Quiz announcement email sent' };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, message: 'Failed to send quiz announcement', error: error.message };
  }
};

// Send Quiz Update/Reminder Email
export const sendQuizUpdateEmail = async (email, userName, quizTitle, updateMessage, actionUrl) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quiz Update - ${quizTitle}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-wrapper { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3); }
        .header { padding: 40px 30px; text-align: center; color: white; }
        .header .icon { font-size: 48px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { background: white; padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .update-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .update-title { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 10px; }
        .update-message { color: #64748b; font-size: 15px; line-height: 1.6; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3); }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 13px; }
        .footer-link { color: #10b981; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">🔔</div>
            <h1>Quiz Update</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p>There's an update regarding your quiz:</p>
            
            <div class="update-box">
              <div class="update-title">📚 ${quizTitle}</div>
              <div class="update-message">${updateMessage}</div>
            </div>

            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              Please check the details and take any necessary action at your earliest convenience.
            </p>

            <div class="button-container">
              <a href="${actionUrl}" class="btn">View Details</a>
            </div>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <p style="margin: 0;">Questions? <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `🔔 Update: ${quizTitle}`,
      html: htmlTemplate
    });

    console.log('Quiz update email sent successfully:', info.messageId);
    return { success: true, message: 'Quiz update email sent' };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, message: 'Failed to send quiz update', error: error.message };
  }
};

// Send Content/Course Update Email
export const sendContentUpdateEmail = async (email, userName, updateType, updateDetails, actionUrl) => {
  const typeConfig = {
    announcement: { icon: '📢', color: '#667eea', title: 'New Announcement' },
    material: { icon: '📂', color: '#10b981', title: 'New Study Material' },
    gradeRelease: { icon: '📊', color: '#f59e0b', title: 'Grades Released' },
    deadlineChange: { icon: '⏰', color: '#ef4444', title: 'Deadline Update' }
  };

  const config = typeConfig[updateType] || typeConfig.announcement;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${config.title} - ${userName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-wrapper { background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
        .header { padding: 40px 30px; text-align: center; color: white; }
        .header .icon { font-size: 48px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { background: white; padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .detail-box { background: #f8fafc; border-left: 4px solid ${config.color}; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 12px 0; }
        .detail-label { font-weight: 600; color: #1e293b; font-size: 14px; }
        .detail-value { color: #64748b; font-size: 14px; margin-top: 4px; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 13px; }
        .footer-link { color: ${config.color}; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">${config.icon}</div>
            <h1>${config.title}</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${userName},</p>
            <p>You have received an important update:</p>
            
            <div class="detail-box">
              ${Object.entries(updateDetails).map(([key, value]) => `
                <div class="detail-item">
                  <div class="detail-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                  <div class="detail-value">${value}</div>
                </div>
              `).join('')}
            </div>

            <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
              Please review this update and take any necessary action.
            </p>

            <div class="button-container">
              <a href="${actionUrl}" class="btn">View Full Details</a>
            </div>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <p style="margin: 0;">Questions? <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `${config.icon} ${config.title}`,
      html: htmlTemplate
    });

    console.log('Content update email sent successfully:', info.messageId);
    return { success: true, message: 'Content update email sent' };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, message: 'Failed to send content update', error: error.message };
  }
};

// Batch Email Sender - For sending to multiple users
export const sendBatchEmails = async (recipients, emailTemplate, templateData) => {
  const results = {
    success: [],
    failed: []
  };

  for (const recipient of recipients) {
    try {
      let htmlContent = emailTemplate;
      
      // Replace template variables
      Object.entries(templateData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, value);
      });

      // Also replace per-recipient data
      Object.entries(recipient).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, value);
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient.email,
        subject: templateData.subject || 'Proctolearn Update',
        html: htmlContent
      });

      results.success.push({
        email: recipient.email,
        messageId: info.messageId
      });

      console.log(`Email sent to ${recipient.email}:`, info.messageId);
    } catch (error) {
      results.failed.push({
        email: recipient.email,
        error: error.message
      });

      console.error(`Failed to send email to ${recipient.email}:`, error.message);
    }
  }

  return results;
};

// Scheduled Email Queue - For storing emails to send later
class EmailQueue {
  constructor() {
    this.queue = [];
  }

  addToQueue(emailData) {
    this.queue.push({
      ...emailData,
      scheduledFor: new Date(emailData.scheduledFor),
      sent: false
    });
    console.log(`Email added to queue for ${emailData.email}`);
  }

  async processQueue() {
    const now = new Date();
    const pendingEmails = this.queue.filter(
      email => !email.sent && email.scheduledFor <= now
    );

    for (const email of pendingEmails) {
      try {
        const result = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: email.email,
          subject: email.subject || 'Update from Proctolearn',
          html: email.html
        });

        email.sent = true;
        email.messageId = result.messageId;
        console.log(`Queued email sent to ${email.email}`);
      } catch (error) {
        console.error(`Failed to send queued email to ${email.email}:`, error.message);
      }
    }

    // Remove sent emails from queue
    this.queue = this.queue.filter(email => !email.sent || email.scheduledFor > now);
  }

  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(e => !e.sent).length,
      sent: this.queue.filter(e => e.sent).length
    };
  }
}

// Send Subscription Confirmation Email (Thank You for Subscribing)
export const sendSubscriptionConfirmationEmail = async (email, subscriberName = 'Valued Subscriber') => {
  const dashboardLink = `${process.env.FRONTEND_URL}`;
  const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Subscribing - Proctolearn</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f7fa; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .email-wrapper { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3); 
        }
        .header { 
          padding: 50px 30px; 
          text-align: center; 
          color: white; 
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .icon { 
          font-size: 64px; 
          margin-bottom: 20px; 
          display: inline-block;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 0.5px; 
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .subtitle {
          margin-top: 10px;
          font-size: 16px;
          opacity: 0.95;
        }
        .content { 
          background: white; 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 20px; 
          color: #1e293b; 
          margin-bottom: 20px; 
          font-weight: 600; 
        }
        .description { 
          color: #64748b; 
          font-size: 15px; 
          line-height: 1.7; 
          margin-bottom: 30px; 
        }
        .success-box {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-left: 4px solid #10b981;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .success-box-title {
          font-weight: 600;
          color: #166534;
          margin-bottom: 8px;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .success-box-text {
          color: #065f46;
          font-size: 14px;
          line-height: 1.6;
        }
        .benefits-section {
          margin: 30px 0;
        }
        .benefits-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .benefit-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          text-align: center;
          transition: all 0.3s ease;
        }
        .benefit-card:hover {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
          transform: translateY(-2px);
        }
        .benefit-icon {
          font-size: 36px;
          margin-bottom: 10px;
        }
        .benefit-title {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .benefit-desc {
          color: #64748b;
          font-size: 12px;
          line-height: 1.4;
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0; 
        }
        .btn { 
          display: inline-block; 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 16px 45px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
        }
        .btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); 
        }
        .preferences-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .preferences-title {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 12px;
          font-size: 15px;
        }
        .preference-list {
          list-style: none;
          padding: 0;
          margin: 10px 0;
        }
        .preference-item {
          color: #78350f;
          font-size: 14px;
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .divider { 
          border-top: 2px solid #e2e8f0; 
          margin: 30px 0; 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 30px; 
          text-align: center; 
          color: #666; 
          font-size: 13px; 
        }
        .footer-link { 
          color: #10b981; 
          text-decoration: none; 
          font-weight: 600;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
        }
        .unsubscribe-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 12px;
        }
        @media only screen and (max-width: 600px) {
          .benefits-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="header-content">
              <div class="icon">🎉</div>
              <h1>Thank You for Subscribing!</h1>
              <div class="subtitle">Welcome to the Proctolearn Community</div>
            </div>
          </div>
          <div class="content">
            <p class="greeting">Hi ${subscriberName}! 👋</p>
            <p class="description">
              We're thrilled to have you join our community! Your subscription has been confirmed, 
              and you'll now receive the latest updates, announcements, and exclusive content from Proctolearn.
            </p>
            
            <div class="success-box">
              <div class="success-box-title">
                <span>✓</span>
                <span>Subscription Confirmed</span>
              </div>
              <div class="success-box-text">
                Your email <strong>${email}</strong> has been successfully added to our mailing list. 
                You're all set to receive updates!
              </div>
            </div>

            <div class="benefits-section">
              <div class="benefits-title">🌟 What You'll Receive</div>
              <div class="benefits-grid">
                <div class="benefit-card">
                  <div class="benefit-icon">📚</div>
                  <div class="benefit-title">Quiz Updates</div>
                  <div class="benefit-desc">Get notified about new quizzes and assessments</div>
                </div>
                <div class="benefit-card">
                  <div class="benefit-icon">🔔</div>
                  <div class="benefit-title">System Updates</div>
                  <div class="benefit-desc">Stay informed about platform improvements</div>
                </div>
                <div class="benefit-card">
                  <div class="benefit-icon">📧</div>
                  <div class="benefit-title">Newsletter</div>
                  <div class="benefit-desc">Monthly insights and educational tips</div>
                </div>
                <div class="benefit-card">
                  <div class="benefit-icon">🎁</div>
                  <div class="benefit-title">Exclusive Content</div>
                  <div class="benefit-desc">Early access to new features</div>
                </div>
              </div>
            </div>

            <div class="button-container">
              <a href="${dashboardLink}" class="btn">Explore Proctolearn →</a>
            </div>

            <div class="preferences-box">
              <div class="preferences-title">📧 Email Preferences</div>
              <ul class="preference-list">
                <li class="preference-item">✓ Quiz Updates - Enabled</li>
                <li class="preference-item">✓ System Updates - Enabled</li>
                <li class="preference-item">✓ Newsletter - Enabled</li>
                <li class="preference-item">○ Promotions - Optional</li>
              </ul>
              <p style="font-size: 12px; color: #78350f; margin: 10px 0 0 0;">
                You can manage your preferences anytime from your account settings.
              </p>
            </div>

            <div class="divider"></div>
            
            <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 10px;">
              <strong>Need Help?</strong> Our support team is here to assist you 24/7.
            </p>
            <p style="font-size: 13px; color: #64748b; text-align: center;">
              <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a> | 
              <a href="${process.env.FRONTEND_URL}/support" class="footer-link">Help Center</a>
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 15px 0; font-weight: 600; color: #1e293b;">Proctolearn - Smart Proctoring Platform</p>
          <p style="margin: 0 0 15px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <div class="social-links">
            <a href="#">Twitter</a> • 
            <a href="#">LinkedIn</a> • 
            <a href="#">Facebook</a> • 
            <a href="#">Instagram</a>
          </div>
          <p style="margin: 15px 0 0 0;">
            <a href="${unsubscribeLink}" class="unsubscribe-link">Unsubscribe from these emails</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🎉 Welcome! Your Subscription is Confirmed',
      html: htmlTemplate
    });

    console.log('Subscription confirmation email sent successfully:', info.messageId);
    return { success: true, message: 'Subscription confirmation email sent' };
  } catch (error) {
    console.error('Email sending error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      command: error.command
    });
    return { success: false, message: 'Failed to send subscription email', error: error.message };
  }
};

// Send Unsubscribe Confirmation Email
export const sendUnsubscribeConfirmationEmail = async (email, subscriberName = 'Valued Subscriber') => {
  const resubscribeLink = `${process.env.FRONTEND_URL}/subscribe?email=${encodeURIComponent(email)}`;
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Unsubscribe Confirmation - Proctolearn</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f7fa; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .email-wrapper { 
          background: linear-gradient(135deg, #64748b 0%, #475569 100%); 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 10px 40px rgba(100, 116, 139, 0.3); 
        }
        .header { 
          padding: 50px 30px; 
          text-align: center; 
          color: white; 
        }
        .icon { 
          font-size: 64px; 
          margin-bottom: 20px; 
          display: inline-block;
        }
        .header h1 { 
          margin: 0; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 0.5px; 
        }
        .content { 
          background: white; 
          padding: 40px 30px; 
        }
        .greeting { 
          font-size: 20px; 
          color: #1e293b; 
          margin-bottom: 20px; 
          font-weight: 600; 
        }
        .description { 
          color: #64748b; 
          font-size: 15px; 
          line-height: 1.7; 
          margin-bottom: 30px; 
        }
        .info-box {
          background: #f8fafc;
          border-left: 4px solid #64748b;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .button-container { 
          text-align: center; 
          margin: 35px 0; 
        }
        .btn { 
          display: inline-block; 
          background: linear-gradient(135deg, #64748b 0%, #475569 100%); 
          color: white; 
          padding: 16px 45px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600; 
          font-size: 16px; 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 30px; 
          text-align: center; 
          color: #666; 
          font-size: 13px; 
        }
        .footer-link { 
          color: #64748b; 
          text-decoration: none; 
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">👋</div>
            <h1>You've Been Unsubscribed</h1>
          </div>
          <div class="content">
            <p class="greeting">Hi ${subscriberName},</p>
            <p class="description">
              Your email <strong>${email}</strong> has been successfully removed from our mailing list. 
              We're sorry to see you go!
            </p>
            
            <div class="info-box">
              <p style="margin: 0; font-size: 14px; color: #64748b;">
                You will no longer receive promotional emails from Proctolearn. However, you may still receive 
                important account-related notifications if you have an active account.
              </p>
            </div>

            <p class="description">
              Changed your mind? You can always resubscribe to stay updated with our latest news and updates.
            </p>

            <div class="button-container">
              <a href="${resubscribeLink}" class="btn">Resubscribe</a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center;">
              Thank you for being part of our community. We hope to see you again soon!
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
          <p style="margin: 0;">Questions? <a href="mailto:support@proctolearn.com" class="footer-link">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Unsubscribe Confirmation - Proctolearn',
      html: htmlTemplate
    });

    console.log('Unsubscribe confirmation email sent successfully:', info.messageId);
    return { success: true, message: 'Unsubscribe confirmation email sent' };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, message: 'Failed to send unsubscribe confirmation', error: error.message };
  }
};

// Send Newsletter Email to All Subscribers
export const sendNewsletterEmail = async (subject, content, recipients) => {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const recipient of recipients) {
    const unsubscribeLink = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}`;
    
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .email-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 13px; }
          .unsubscribe { color: #94a3b8; text-decoration: none; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <h1>📰 ${subject}</h1>
            </div>
            <div class="content">
              ${content}
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© 2026 Proctolearn. All rights reserved.</p>
            <p style="margin: 10px 0;"><a href="${unsubscribeLink}" class="unsubscribe">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient.email,
        subject: subject,
        html: htmlTemplate
      });
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({ email: recipient.email, error: error.message });
    }
  }

  return results;
};

export const emailQueue = new EmailQueue();

// Start email queue processor
export const startEmailQueueProcessor = (intervalMs = 60000) => {
  console.log('✓ Email queue processor started (checks every ' + intervalMs / 1000 + ' seconds)');
  setInterval(() => {
    emailQueue.processQueue();
  }, intervalMs);
};

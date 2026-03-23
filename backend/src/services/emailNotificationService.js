import {
  sendNewQuizEmail,
  sendQuizUpdateEmail,
  sendContentUpdateEmail,
  sendBatchEmails,
  emailQueue
} from '../utils/emailService.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';

// Send quiz announcement to all enrolled students
export const notifyNewQuiz = async (quizId, quizTitle, subject, dueDate, enrolledStudents) => {
  const emailResults = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (const student of enrolledStudents) {
    if (student?.preferences?.emailNotifications === false) {
      emailResults.skipped++;
      continue;
    }

    try {
      const quizLink = `${process.env.FRONTEND_URL}/quiz/${quizId}`;
      const result = await sendNewQuizEmail(
        student.email,
        student.firstName,
        quizTitle,
        subject,
        dueDate,
        quizLink
      );

      if (result.success) {
        emailResults.success++;
      } else {
        emailResults.failed++;
        emailResults.errors.push({ email: student.email, error: result.message });
      }
    } catch (error) {
      emailResults.failed++;
      emailResults.errors.push({ email: student.email, error: error.message });
    }
  }

  return emailResults;
};

// Schedule quiz reminder emails
export const scheduleQuizReminder = async (quizId, enrolledStudents, reminderTime) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new Error('Quiz not found');

  let scheduledCount = 0;

  for (const student of enrolledStudents) {
    if (student?.preferences?.emailNotifications === false) {
      continue;
    }

    const emailData = {
      email: student.email,
      subject: `⏰ Reminder: Quiz "${quiz.title}" Due Soon`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f4f7fa; }
            .container { max-width: 600px; margin: 20px auto; }
            .card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { font-size: 24px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
            .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">⏰ Quiz Reminder</div>
              <p>Hi ${student.firstName},</p>
              <div class="reminder-box">
                <strong>Quiz:</strong> ${quiz.title}<br>
                <strong>Due:</strong> ${new Date(quiz.dueDate).toLocaleDateString()}<br>
                <strong>Time Remaining:</strong> Please check your dashboard for exact time.
              </div>
              <p>Don't forget to complete this quiz before the deadline!</p>
              <a href="${process.env.FRONTEND_URL}/quiz/${quizId}" class="btn">Take Quiz</a>
            </div>
          </div>
        </body>
        </html>
      `,
      scheduledFor: reminderTime
    };

    emailQueue.addToQueue(emailData);
    scheduledCount++;
  }

  return {
    success: true,
    message: `${scheduledCount} reminder emails scheduled`
  };
};

// Send quiz update to enrolled students
export const notifyQuizUpdate = async (quizId, updateMessage, enrolledStudents) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new Error('Quiz not found');

  const emailResults = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const student of enrolledStudents) {
    if (student?.preferences?.emailNotifications === false) {
      emailResults.skipped++;
      continue;
    }

    try {
      const actionUrl = `${process.env.FRONTEND_URL}/quiz/${quizId}`;
      const result = await sendQuizUpdateEmail(
        student.email,
        student.firstName,
        quiz.title,
        updateMessage,
        actionUrl
      );

      if (result.success) {
        emailResults.success++;
      } else {
        emailResults.failed++;
      }
    } catch (error) {
      emailResults.failed++;
      console.error('Error sending update email:', error);
    }
  }

  return emailResults;
};

// Send content/course update to students
export const notifyContentUpdate = async (updateType, updateDetails, recipientEmails, actionUrl) => {
  const emailResults = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (const email of recipientEmails) {
    try {
      // Get student name if email is in standard format
      const student = await User.findOne({ email });
      if (student?.preferences?.emailNotifications === false) {
        emailResults.skipped++;
        continue;
      }
      const studentName = student ? student.firstName : 'Student';

      const result = await sendContentUpdateEmail(
        email,
        studentName,
        updateType,
        updateDetails,
        actionUrl
      );

      if (result.success) {
        emailResults.success++;
      } else {
        emailResults.failed++;
        emailResults.errors.push({ email, error: result.message });
      }
    } catch (error) {
      emailResults.failed++;
      emailResults.errors.push({ email, error: error.message });
    }
  }

  return emailResults;
};

// Send batch announcement emails
export const sendBulkAnnouncement = async (recipientEmails, title, message, actionUrl) => {
  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f4f7fa; }
        .container { max-width: 600px; margin: 20px auto; }
        .email-wrapper { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3); }
        .header { padding: 40px 30px; text-align: center; color: white; }
        .header .icon { font-size: 48px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { background: white; padding: 40px 30px; }
        .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; font-weight: 600; }
        .message { color: #64748b; font-size: 15px; line-height: 1.7; margin: 20px 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .btn:hover { transform: translateY(-2px); }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-wrapper">
          <div class="header">
            <div class="icon">📢</div>
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello {{userName}},</p>
            <div class="message">${message}</div>
            <div class="button-container">
              <a href="${actionUrl}" class="btn">Learn More</a>
            </div>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">© 2026 Proctolearn. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const users = await User.find({ email: { $in: recipientEmails } }).select('email firstName preferences.emailNotifications');
  const usersByEmail = new Map(users.map((u) => [u.email, u]));

  const recipients = recipientEmails
    .filter((email) => usersByEmail.get(email)?.preferences?.emailNotifications !== false)
    .map(email => ({
      email,
      userName: usersByEmail.get(email)?.firstName || 'Student'
    }));

  return await sendBatchEmails(recipients, emailTemplate, { subject: title });
};

// Schedule batch emails for later
export const scheduleBulkEmails = async (recipientEmails, subject, htmlTemplate, scheduledFor) => {
  const scheduledEmails = [];

  const users = await User.find({ email: { $in: recipientEmails } }).select('email preferences.emailNotifications');
  const usersByEmail = new Map(users.map((u) => [u.email, u]));

  for (const email of recipientEmails) {
    if (usersByEmail.get(email)?.preferences?.emailNotifications === false) {
      continue;
    }

    const emailData = {
      email,
      subject,
      html: htmlTemplate,
      scheduledFor
    };
    emailQueue.addToQueue(emailData);
    scheduledEmails.push(email);
  }

  return {
    success: true,
    message: `${scheduledEmails.length} emails scheduled for ${new Date(scheduledFor).toLocaleString()}`,
    scheduledEmails
  };
};

// Get email queue status
export const getEmailQueueStatus = () => {
  return emailQueue.getQueueStatus();
};

export default {
  notifyNewQuiz,
  scheduleQuizReminder,
  notifyQuizUpdate,
  notifyContentUpdate,
  sendBulkAnnouncement,
  scheduleBulkEmails,
  getEmailQueueStatus
};

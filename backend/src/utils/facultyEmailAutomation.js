/**
 * Faculty Email Automation Service
 * Handles automated email notifications for faculty members based on system events
 */

import Subscriber from '../models/Subscriber.js';
import Quiz from '../models/Quiz.js';
import { sendNewsletterEmail } from './emailService.js';
import logger from './logger.js';

// Send faculty notification emails based on event type
export const sendFacultyNotification = async (eventType, data) => {
  try {
    // Fetch active subscribers with relevant preferences
    const query = { isActive: true };
    
    // Filter subscribers based on event type
    switch (eventType) {
      case 'quiz-update':
        query['preferences.quizUpdates'] = true;
        break;
      case 'system-announcement':
        query['preferences.systemUpdates'] = true;
        break;
      case 'weekly-newsletter':
        query['preferences.newsletter'] = true;
        break;
      case 'new-submission':
        query['preferences.quizUpdates'] = true;
        break;
      default:
        return { success: false, message: 'Unknown event type' };
    }

    const recipients = await Subscriber.find(query).select('email name').lean();

    if (recipients.length === 0) {
      logger.warn(`No subscribers found for event: ${eventType}`);
      return { success: true, sent: 0, message: 'No recipients found' };
    }

    // Generate email content based on event type
    const emailContent = generateEmailContent(eventType, data);

    // Send emails in batch
    const result = await sendNewsletterEmail(emailContent.subject, emailContent.html, recipients);

    logger.info(`Faculty notification sent - Event: ${eventType}, Recipients: ${result.success}, Failed: ${result.failed}`);

    return {
      success: true,
      sent: result.success,
      failed: result.failed,
      eventType
    };
  } catch (error) {
    logger.error('Faculty notification error:', error);
    return { success: false, message: error.message };
  }
};

// Generate HTML content for different notification types
const generateEmailContent = (eventType, data) => {
  const templates = {
    'quiz-update': () => ({
      subject: `🎓 New Quiz Update: ${data.quizTitle || 'Quiz'}`,
      html: `
        <p>Hi Faculty Member,</p>
        <p>We're excited to inform you about a new quiz update in your ProctoLearn dashboard:</p>
        <div style="background: #f0f9ff; border-left: 4px solid #0EA5E9; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0369a1;">${data.quizTitle}</h3>
          <p><strong>Status:</strong> ${data.status}</p>
          <p><strong>Duration:</strong> ${data.duration} minutes</p>
          <p><strong>Questions:</strong> ${data.totalQuestions}</p>
          ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
        </div>
        <p><a href="${process.env.FRONTEND_URL}/my-quizzes" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Quiz</a></p>
        <p>Best regards,<br><strong>ProctoLearn Team</strong></p>
      `
    }),

    'system-announcement': () => ({
      subject: `📢 System Update: ${data.title || 'Important Announcement'}`,
      html: `
        <p>Hi Faculty Member,</p>
        <p>We have an important system update for you:</p>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #92400e;">${data.title}</h3>
          <p>${data.message}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">View Dashboard</a></p>
        <p>Best regards,<br><strong>ProctoLearn Team</strong></p>
      `
    }),

    'new-submission': () => ({
      subject: `✅ New Quiz Submission: ${data.quizTitle}`,
      html: `
        <p>Hi ${data.facultyName || 'Faculty Member'},</p>
        <p>You have a new quiz submission to review:</p>
        <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #166534;">New Submission Received</h3>
          <p><strong>Student:</strong> ${data.studentName}</p>
          <p><strong>Quiz:</strong> ${data.quizTitle}</p>
          <p><strong>Score:</strong> ${data.score}/${data.maxScore || 100}</p>
          <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL}/grade-submissions" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Review Submission</a></p>
        <p>Best regards,<br><strong>ProctoLearn Team</strong></p>
      `
    }),

    'weekly-newsletter': () => ({
      subject: `📰 Your Weekly ProctoLearn Newsletter`,
      html: `
        <p>Hi Faculty Member,</p>
        <p>Here's your weekly digest of ProctoLearn updates and insights:</p>
        
        <div style="background: #f0f4f8; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #1e3a8a;">📊 This Week's Highlights</h3>
          ${data.weeklyStats ? `
            <ul style="color: #333;">
              <li><strong>Total Quizzes Created:</strong> ${data.weeklyStats.quizzesCreated || 0}</li>
              <li><strong>Student Submissions:</strong> ${data.weeklyStats.submissions || 0}</li>
              <li><strong>Average Score:</strong> ${data.weeklyStats.avgScore || 'N/A'}</li>
              <li><strong>Active Sessions:</strong> ${data.weeklyStats.activeSessions || 0}</li>
            </ul>
          ` : ''}
        </div>

        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #166534;">💡 Pro Tips</h3>
          <p>✓ Use live monitoring to catch suspicious activities in real-time</p>
          <p>✓ Export your quiz results as CSV for better analysis</p>
          <p>✓ Check the activity feed for immediate student engagement updates</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 600;">Go to Dashboard</a>
        </div>

        <p style="color: #666; font-size: 13px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          You're receiving this because you're subscribed to newsletters. 
          <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #10b981; text-decoration: none;">Manage preferences</a>
        </p>
        <p>Best regards,<br><strong>ProctoLearn Team</strong></p>
      `
    })
  };

  const templateFn = templates[eventType] || templates['system-announcement'];
  return templateFn();
};

// Send periodic newsletters (e.g., weekly)
export const sendWeeklyNewsletter = async () => {
  try {
    const subscribers = await Subscriber.find({
      isActive: true,
      'preferences.newsletter': true
    }).select('email name').lean();

    if (subscribers.length === 0) {
      logger.info('No subscribers for weekly newsletter');
      return { success: true, sent: 0 };
    }

    // Gather weekly statistics
    const weeklyStats = await gatherWeeklyStats();

    const emailContent = generateEmailContent('weekly-newsletter', { weeklyStats });
    const result = await sendNewsletterEmail(emailContent.subject, emailContent.html, subscribers);

    logger.info(`Weekly newsletter sent: ${result.success} successful, ${result.failed} failed`);
    return { success: true, ...result };
  } catch (error) {
    logger.error('Weekly newsletter error:', error);
    return { success: false, message: error.message };
  }
};

// Gather weekly statistics for newsletter
const gatherWeeklyStats = async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      quizzesCreated: await Quiz.countDocuments({
        createdAt: { $gte: oneWeekAgo }
      }),
      // Add more stats based on your models
      submissions: 0,
      avgScore: 'TBD',
      activeSessions: 0
    };

    return stats;
  } catch (error) {
    logger.error('Error gathering weekly stats:', error);
    return {
      quizzesCreated: 0,
      submissions: 0,
      avgScore: 'N/A',
      activeSessions: 0
    };
  }
};

// Subscribe a new faculty member and send confirmation
export const subscribeFaculty = async (email, name, preferences) => {
  try {
    const subscriber = await Subscriber.findOne({ email });

    if (subscriber && subscriber.isActive) {
      return { success: false, message: 'Already subscribed' };
    }

    if (subscriber && !subscriber.isActive) {
      await subscriber.resubscribe();
    } else {
      const newSubscriber = new Subscriber({
        email,
        name,
        preferences,
        source: 'faculty-dashboard'
      });
      await newSubscriber.save();
    }

    // Send subscription confirmation
    const confirmContent = generateEmailContent('system-announcement', {
      title: '✅ Subscription Confirmed',
      message: `Welcome to ProctoLearn faculty notifications! You will now receive updates about quizzes, system changes, and weekly insights.`
    });

    await sendNewsletterEmail(confirmContent.subject, confirmContent.html, [{ email, name }]);

    return { success: true, message: 'Subscription confirmed' };
  } catch (error) {
    logger.error('Faculty subscription error:', error);
    return { success: false, message: error.message };
  }
};

export default {
  sendFacultyNotification,
  sendWeeklyNewsletter,
  subscribeFaculty
};

import express from 'express';
import {
  sendQuizAnnouncement,
  scheduleQuizReminderEmail,
  sendQuizUpdateNotification,
  sendContentUpdateNotification,
  sendBulkAnnouncementEmail,
  scheduleEmails,
  getQueueStatus,
  sendGradesNotification,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';
import { auth, verifyInstitutionAccess } from '../middleware/auth.js';

const router = express.Router();

// All notification routes require authentication
router.use(auth);
router.use(verifyInstitutionAccess);

// Quiz announcement - notify enrolled students
router.post('/send-quiz-announcement/:quizId', sendQuizAnnouncement);

// Schedule quiz reminder emails
router.post('/schedule-quiz-reminder/:quizId', scheduleQuizReminderEmail);

// Send quiz updates to students
router.post('/quiz-update/:quizId', sendQuizUpdateNotification);

// Send content/course updates
router.post('/content-update', sendContentUpdateNotification);

// Send bulk announcement (admin only)
router.post('/bulk-announcement', sendBulkAnnouncementEmail);

// Schedule emails for later
router.post('/schedule-emails', scheduleEmails);

// Get email queue status
router.get('/queue-status', getQueueStatus);

// Send grades released notification
router.post('/grades-notification/:quizId', sendGradesNotification);

// Persistent notification feed & read tracking
router.get('/feed', getMyNotifications);
router.patch('/read/:notificationId', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;

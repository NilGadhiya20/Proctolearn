import express from 'express';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateSubscriptionPreferences,
  getAllSubscribers,
  getSubscriberStats,
  sendNewsletterToSubscribers,
  checkSubscriptionStatus,
  sendFacultyNotificationEmail,
  triggerWeeklyNewsletter
} from '../controllers/subscriptionController.js';
import { auth, checkRole } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);
router.get('/check-status', checkSubscriptionStatus);
router.patch('/preferences', updateSubscriptionPreferences);

// Admin only routes
router.get('/all', auth, checkRole(USER_ROLES.ADMIN), getAllSubscribers);
router.get('/stats', auth, checkRole(USER_ROLES.ADMIN), getSubscriberStats);
router.post('/send-newsletter', auth, checkRole(USER_ROLES.ADMIN), sendNewsletterToSubscribers);

// Faculty email automation routes (Admin only)
router.post('/send-faculty-notification', auth, checkRole(USER_ROLES.ADMIN), sendFacultyNotificationEmail);
router.post('/weekly-newsletter', auth, checkRole(USER_ROLES.ADMIN), triggerWeeklyNewsletter);

export default router;

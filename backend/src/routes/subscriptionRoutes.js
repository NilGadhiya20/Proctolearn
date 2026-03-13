import express from 'express';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateSubscriptionPreferences,
  getAllSubscribers,
  getSubscriberStats,
  sendNewsletterToSubscribers,
  checkSubscriptionStatus
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

export default router;

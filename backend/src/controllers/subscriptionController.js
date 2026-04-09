import Subscriber from '../models/Subscriber.js';
import User from '../models/User.js';
import { sendSubscriptionConfirmationEmail, sendUnsubscribeConfirmationEmail, sendNewsletterEmail } from '../utils/emailService.js';
import { sendFacultyNotification, sendWeeklyNewsletter } from '../utils/facultyEmailAutomation.js';

// Subscribe to mailing list
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name, preferences, source } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    // Validate email
    if (!normalizedEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Allow subscriptions only for registered users
    const existingUser = await User.findOne({ email: normalizedEmail, isActive: true })
      .select('firstName lastName email');

    if (!existingUser) {
      return res.status(403).json({
        success: false,
        requiresAccount: true,
        redirectTo: '/register',
        message: 'To subscribe for updates, please create an account first.'
      });
    }

    const resolvedName =
      name?.trim() || `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim();

    // Check if already subscribed
    let subscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (subscriber) {
      // If previously unsubscribed, reactivate
      if (!subscriber.isActive) {
        await subscriber.resubscribe();
        
        // Send welcome back email
        await sendSubscriptionConfirmationEmail(normalizedEmail, resolvedName || subscriber.name);

        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
          subscriber: {
            email: subscriber.email,
            name: subscriber.name,
            isActive: subscriber.isActive,
            subscribedAt: subscriber.subscribedAt
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to our mailing list.',
        subscriber: {
          email: subscriber.email,
          name: subscriber.name,
          isActive: subscriber.isActive,
          subscribedAt: subscriber.subscribedAt
        }
      });
    }

    // Create new subscriber
    const subscriberData = {
      email: normalizedEmail,
      name: resolvedName || '',
      source: source || 'website',
      preferences: preferences || {
        quizUpdates: true,
        systemUpdates: true,
        newsletter: true,
        promotions: false
      },
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer || req.headers.referrer
      }
    };

    subscriber = new Subscriber(subscriberData);
    await subscriber.save();

    // Send subscription confirmation email
    const emailResult = await sendSubscriptionConfirmationEmail(normalizedEmail, resolvedName);

    if (emailResult.success) {
      await subscriber.incrementEmailCount();
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! A confirmation email has been sent.',
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
        isActive: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt,
        preferences: subscriber.preferences
      }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to our mailing list.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process subscription. Please try again later.',
      error: error.message
    });
  }
};

// Unsubscribe from mailing list
export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our mailing list'
      });
    }

    if (!subscriber.isActive) {
      return res.status(200).json({
        success: true,
        message: 'You are already unsubscribed from our mailing list.'
      });
    }

    // Unsubscribe
    await subscriber.unsubscribe();

    // Send unsubscribe confirmation email
    await sendUnsubscribeConfirmationEmail(email, subscriber.name);

    return res.status(200).json({
      success: true,
      message: 'You have been successfully unsubscribed from our mailing list.'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process unsubscription. Please try again later.',
      error: error.message
    });
  }
};

// Update subscription preferences
export const updateSubscriptionPreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    // Update preferences
    if (preferences) {
      subscriber.preferences = {
        ...subscriber.preferences,
        ...preferences
      };
      await subscriber.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription preferences updated successfully',
      preferences: subscriber.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update preferences. Please try again later.',
      error: error.message
    });
  }
};

// Get all active subscribers (Admin only)
export const getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await Subscriber.countDocuments(query);

    return res.status(200).json({
      success: true,
      subscribers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message
    });
  }
};

// Get subscriber statistics (Admin only)
export const getSubscriberStats = async (req, res) => {
  try {
    const totalSubscribers = await Subscriber.countDocuments();
    const activeSubscribers = await Subscriber.countDocuments({ isActive: true });
    const inactiveSubscribers = await Subscriber.countDocuments({ isActive: false });

    // Get recent subscribers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubscribers = await Subscriber.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo }
    });

    // Get subscribers by source
    const subscribersBySource = await Subscriber.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: inactiveSubscribers,
        recentSubscribers,
        bySource: subscribersBySource
      }
    });

  } catch (error) {
    console.error('Get subscriber stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriber statistics',
      error: error.message
    });
  }
};

// Send newsletter to all active subscribers (Admin only)
export const sendNewsletterToSubscribers = async (req, res) => {
  try {
    const { subject, content, preferenceType } = req.body;

    if (!subject || !content) {
      return res.status(400).json({
        success: false,
        message: 'Subject and content are required'
      });
    }

    // Get active subscribers based on preference
    let subscribers;
    if (preferenceType) {
      subscribers = await Subscriber.getSubscribersByPreference(preferenceType);
    } else {
      subscribers = await Subscriber.getActiveSubscribers();
    }

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    // Send newsletter
    const results = await sendNewsletterEmail(subject, content, subscribers);

    // Update email count for successful sends
    for (const subscriber of subscribers) {
      if (results.success > 0) {
        await subscriber.incrementEmailCount();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Newsletter sent successfully',
      results: {
        totalRecipients: subscribers.length,
        successfullySent: results.success,
        failed: results.failed,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('Send newsletter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: error.message
    });
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(200).json({
        success: true,
        isSubscribed: false,
        message: 'Email not found in our mailing list'
      });
    }

    return res.status(200).json({
      success: true,
      isSubscribed: subscriber.isActive,
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
        isActive: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt,
        preferences: subscriber.preferences
      }
    });

  } catch (error) {
    console.error('Check subscription status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      error: error.message
    });
  }
};

// Send faculty notification email (Admin only)
export const sendFacultyNotificationEmail = async (req, res) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType || !data) {
      return res.status(400).json({
        success: false,
        message: 'Event type and data are required'
      });
    }

    const result = await sendFacultyNotification(eventType, data);

    return res.status(result.success ? 200 : 400).json({
      success: result.success,
      message: result.message,
      sent: result.sent,
      failed: result.failed,
      eventType
    });

  } catch (error) {
    console.error('Send faculty notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send faculty notification',
      error: error.message
    });
  }
};

// Send weekly newsletter to faculty (Admin only)
export const triggerWeeklyNewsletter = async (req, res) => {
  try {
    const result = await sendWeeklyNewsletter();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Weekly newsletter sent successfully',
        sent: result.sent,
        failed: result.failed
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Weekly newsletter error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send weekly newsletter',
      error: error.message
    });
  }
};

export default {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateSubscriptionPreferences,
  getAllSubscribers,
  getSubscriberStats,
  sendNewsletterToSubscribers,
  checkSubscriptionStatus,
  sendFacultyNotificationEmail,
  triggerWeeklyNewsletter
};

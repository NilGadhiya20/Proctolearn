import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  lastEmailSentAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['website', 'landing_page', 'dashboard', 'admin', 'api'],
    default: 'website'
  },
  preferences: {
    quizUpdates: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index for faster queries
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1 });
subscriberSchema.index({ subscribedAt: -1 });

// Method to unsubscribe
subscriberSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to resubscribe
subscriberSchema.methods.resubscribe = function() {
  this.isActive = true;
  this.unsubscribedAt = null;
  return this.save();
};

// Method to update email sent count
subscriberSchema.methods.incrementEmailCount = function() {
  this.emailsSent += 1;
  this.lastEmailSentAt = new Date();
  return this.save();
};

// Static method to get active subscribers
subscriberSchema.statics.getActiveSubscribers = function() {
  return this.find({ isActive: true }).sort({ subscribedAt: -1 });
};

// Static method to get subscribers by preference
subscriberSchema.statics.getSubscribersByPreference = function(preferenceKey) {
  const query = { isActive: true };
  query[`preferences.${preferenceKey}`] = true;
  return this.find(query);
};

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;

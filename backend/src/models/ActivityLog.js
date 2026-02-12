import mongoose from 'mongoose';
import { ACTIVITY_TYPES, ALERT_SEVERITY } from '../config/constants.js';

const activityLogSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentSubmission',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true
    },
    activityType: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      required: true
    },
    severity: {
      type: String,
      enum: Object.values(ALERT_SEVERITY),
      default: ALERT_SEVERITY.LOW
    },
    description: String,
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    details: {
      fromTab: String,
      toTab: String,
      eventType: String,
      keyCode: Number,
      metadata: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    browserInfo: {
      name: String,
      version: String,
      platform: String
    },
    screenResolution: {
      width: Number,
      height: Number
    },
    isAnomalous: { type: Boolean, default: false },
    anomalyScore: { type: Number, default: 0 },
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: mongoose.Schema.Types.ObjectId,
    acknowledgedAt: Date
  },
  {
    timestamps: false
  }
);

// Index for faster queries
activityLogSchema.index({ submission: 1, timestamp: -1 });
activityLogSchema.index({ student: 1, quiz: 1 });
activityLogSchema.index({ activityType: 1, severity: 1 });
activityLogSchema.index({ isAnomalous: 1 });
activityLogSchema.index({ institution: 1 });

// TTL Index - Auto delete logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export default mongoose.model('ActivityLog', activityLogSchema);

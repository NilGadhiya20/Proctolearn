import mongoose from 'mongoose';
import { SUBMISSION_STATUS } from '../config/constants.js';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: mongoose.Schema.Types.Mixed,
  selectedOptions: [String],
  attemptTime: Date,
  timeSpent: Number,
  isCorrect: Boolean,
  marksObtained: Number,
  marksAllotted: Number
});

const submissionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.IN_PROGRESS
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: Date,
    submittedAt: Date,
    totalTimeSpent: Number,
    answers: [answerSchema],
    totalMarksObtained: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    isPassed: Boolean,
    grade: String,
    feedback: String,
    ipAddress: String,
    userAgent: String,
    attemptNumber: { type: Number, default: 1 },
    flaggedAnswers: [mongoose.Schema.Types.ObjectId],
    activityLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivityLog'
      }
    ],
    suspiciousActivityDetected: { type: Boolean, default: false },
    suspicionScore: { type: Number, default: 0 },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    reviewNotes: String
  },
  {
    timestamps: true
  }
);

// Index for faster queries
submissionSchema.index({ quiz: 1, student: 1 });
submissionSchema.index({ institution: 1, status: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ suspiciousActivityDetected: 1 });

export default mongoose.model('StudentSubmission', submissionSchema);

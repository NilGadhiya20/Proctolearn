import mongoose from 'mongoose';

const examSessionSchema = new mongoose.Schema(
  {
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
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentSubmission'
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: String,
        isCorrect: Boolean,
        marksObtained: Number
      }
    ],
    totalMarks: {
      type: Number,
      default: 0
    },
    obtainedMarks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'auto-submitted'],
      default: 'in-progress'
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    securityFlags: {
      tabSwitches: {
        type: Number,
        default: 0
      },
      rightClickAttempts: {
        type: Number,
        default: 0
      },
      copyPasteAttempts: {
        type: Number,
        default: 0
      },
      suspiciousActivities: [
        {
          activity: String,
          timestamp: Date
        }
      ]
    },
    deviceInfo: {
      userAgent: String,
      resolution: String,
      browser: String
    },
    isFullscreenMaintained: {
      type: Boolean,
      default: true
    },
    autoSubmitted: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for quick queries
examSessionSchema.index({ student: 1, quiz: 1 });
examSessionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('ExamSession', examSessionSchema);

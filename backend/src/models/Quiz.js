import mongoose from 'mongoose';
import { QUIZ_STATUS } from '../config/constants.js';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters']
    },
    description: String,
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: String,
    chapter: String,
    totalQuestions: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    passingMarks: { type: Number, default: 0 },
    duration: {
      type: Number,
      required: [true, 'Quiz duration is required (in minutes)']
    },
    status: {
      type: String,
      enum: Object.values(QUIZ_STATUS),
      default: QUIZ_STATUS.DRAFT
    },
    startTime: Date,
    endTime: Date,
    accessWindow: {
      startDate: Date,
      endDate: Date,
      timeZone: String
    },
    attemptSettings: {
      hasLimit: { type: Boolean, default: false },
      maxAttempts: { type: Number, default: null }
    },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    showAnswerExplanation: { type: Boolean, default: true },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkPercentage: { type: Number, default: 0 },
    proctoring: {
      enabled: { type: Boolean, default: true },
      requiresFullscreen: { type: Boolean, default: true },
      allowTabSwitching: { type: Boolean, default: false },
      allowMultipleWindows: { type: Boolean, default: false },
      webcamRequired: { type: Boolean, default: false },
      microphoneRequired: { type: Boolean, default: false }
    },
    reviewSettings: {
      allowReview: { type: Boolean, default: true },
      reviewAfterSubmission: { type: Boolean, default: false }
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    assignedFaculty: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    totalAttempts: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
quizSchema.index({ institution: 1, createdBy: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model('Quiz', quizSchema);

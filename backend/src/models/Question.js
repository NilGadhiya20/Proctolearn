import mongoose from 'mongoose';
import { QUESTION_TYPES } from '../config/constants.js';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    questionType: {
      type: String,
      enum: Object.values(QUESTION_TYPES),
      default: QUESTION_TYPES.MULTIPLE_CHOICE
    },
    options: [optionSchema],
    correctAnswer: mongoose.Schema.Types.Mixed,
    explanation: String,
    marks: {
      type: Number,
      default: 1,
      min: 0
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    imageUrl: String,
    order: Number,
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
questionSchema.index({ quiz: 1, order: 1 });

export default mongoose.model('Question', questionSchema);

import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    website: String,
    logo: String,
    description: String,
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    departments: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'professional', 'enterprise'],
      default: 'free'
    },
    subscriptionExpiry: Date,
    totalQuizzes: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    settings: {
      emailVerificationRequired: { type: Boolean, default: true },
      autoSubmitOnTimeout: { type: Boolean, default: true },
      allowTabSwitching: { type: Boolean, default: false },
      requireFullscreen: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
institutionSchema.index({ code: 1 });
institutionSchema.index({ adminUser: 1 });

export default mongoose.model('Institution', institutionSchema);

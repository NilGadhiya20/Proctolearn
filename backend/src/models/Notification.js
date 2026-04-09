import mongoose from "mongoose";
import { USER_ROLES, ALERT_SEVERITY } from "../config/constants.js";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "system" },
    severity: {
      type: String,
      enum: ["info", ...Object.values(ALERT_SEVERITY)],
      default: "info",
    },
    audience: {
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      roles: [{ type: String, enum: Object.values(USER_ROLES) }],
      institution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        default: null,
      },
    },
    context: {
      quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
      submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentSubmission",
      },
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      metadata: mongoose.Schema.Types.Mixed,
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    dismissedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        dismissedAt: { type: Date, default: Date.now },
      },
    ],
    deletedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deletedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ "audience.users": 1, createdAt: -1 });
notificationSchema.index({
  "audience.roles": 1,
  "audience.institution": 1,
  createdAt: -1,
});

export default mongoose.model("Notification", notificationSchema);

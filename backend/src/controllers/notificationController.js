import {
  notifyNewQuiz,
  scheduleQuizReminder,
  notifyQuizUpdate,
  notifyContentUpdate,
  sendBulkAnnouncement,
  scheduleBulkEmails,
  getEmailQueueStatus,
} from "../services/emailNotificationService.js";
import {
  createAndDispatchNotification,
  fetchNotificationsForUser,
  markNotificationRead as markNotificationReadService,
  markAllNotificationsRead as markAllNotificationsReadService,
  clearAllNotificationsForUser,
} from "../services/notificationService.js";
import Quiz from "../models/Quiz.js";
import StudentSubmission from "../models/StudentSubmission.js";
import User from "../models/User.js";

// POST /api/notifications/send-quiz-announcement
export const sendQuizAnnouncement = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { enrolledStudentIds } = req.body;

    // Only faculty/admin can send notifications
    if (!["faculty", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only faculty and admins can send notifications",
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    // Get student details
    const students = await User.find({
      _id: { $in: enrolledStudentIds },
      role: "student",
    }).select("email firstName preferences.emailNotifications");

    const result = await notifyNewQuiz(
      quizId,
      quiz.title,
      quiz.subject || "General",
      quiz.dueDate,
      students,
    );

    res.json({
      success: true,
      message: `Notification sent to ${result.success} students`,
      details: result,
    });
  } catch (error) {
    console.error("Error sending quiz announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send announcement",
      error: error.message,
    });
  }
};

// POST /api/notifications/schedule-quiz-reminder
export const scheduleQuizReminderEmail = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { enrolledStudentIds, reminderTime } = req.body;

    if (!reminderTime) {
      return res.status(400).json({
        success: false,
        message: "reminderTime is required",
      });
    }

    const students = await User.find({
      _id: { $in: enrolledStudentIds },
      role: "student",
    }).select("email firstName preferences.emailNotifications");

    const result = await scheduleQuizReminder(quizId, students, reminderTime);

    res.json({
      success: true,
      message: result.message,
      scheduledFor: new Date(reminderTime),
    });
  } catch (error) {
    console.error("Error scheduling quiz reminder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule reminder",
      error: error.message,
    });
  }
};

// POST /api/notifications/quiz-update
export const sendQuizUpdateNotification = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { updateMessage, enrolledStudentIds } = req.body;

    if (!updateMessage) {
      return res.status(400).json({
        success: false,
        message: "updateMessage is required",
      });
    }

    const students = await User.find({
      _id: { $in: enrolledStudentIds },
      role: "student",
    }).select("email firstName preferences.emailNotifications");

    const result = await notifyQuizUpdate(quizId, updateMessage, students);

    res.json({
      success: true,
      message: `Update sent to ${result.success} students`,
      details: result,
    });
  } catch (error) {
    console.error("Error sending quiz update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send update",
      error: error.message,
    });
  }
};

// POST /api/notifications/content-update
export const sendContentUpdateNotification = async (req, res) => {
  try {
    const { updateType, updateDetails, recipientEmails, actionUrl } = req.body;

    if (!updateType || !updateDetails || !recipientEmails || !actionUrl) {
      return res.status(400).json({
        success: false,
        message:
          "updateType, updateDetails, recipientEmails, and actionUrl are required",
      });
    }

    const result = await notifyContentUpdate(
      updateType,
      updateDetails,
      recipientEmails,
      actionUrl,
    );

    res.json({
      success: true,
      message: `Update sent to ${result.success} recipients`,
      details: result,
    });
  } catch (error) {
    console.error("Error sending content update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send content update",
      error: error.message,
    });
  }
};

// POST /api/notifications/bulk-announcement
export const sendBulkAnnouncementEmail = async (req, res) => {
  try {
    const { title, message, recipientEmails, actionUrl } = req.body;

    // Only admins can send bulk announcements
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can send bulk announcements",
      });
    }

    if (!title || !message || !recipientEmails || !actionUrl) {
      return res.status(400).json({
        success: false,
        message: "title, message, recipientEmails, and actionUrl are required",
      });
    }

    const result = await sendBulkAnnouncement(
      recipientEmails,
      title,
      message,
      actionUrl,
    );

    res.json({
      success: true,
      message: `Announcement sent to ${result.success} recipients`,
      details: result,
    });
  } catch (error) {
    console.error("Error sending bulk announcement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send announcement",
      error: error.message,
    });
  }
};

// POST /api/notifications/schedule-bulk-emails
export const scheduleEmails = async (req, res) => {
  try {
    const { subject, htmlTemplate, recipientEmails, scheduledFor } = req.body;

    if (!subject || !htmlTemplate || !recipientEmails || !scheduledFor) {
      return res.status(400).json({
        success: false,
        message:
          "subject, htmlTemplate, recipientEmails, and scheduledFor are required",
      });
    }

    const scheduledTime = new Date(scheduledFor);
    if (scheduledTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "scheduledFor must be a future time",
      });
    }

    const result = await scheduleBulkEmails(
      recipientEmails,
      subject,
      htmlTemplate,
      scheduledFor,
    );

    res.json({
      success: true,
      message: result.message,
      scheduledFor: scheduledTime,
    });
  } catch (error) {
    console.error("Error scheduling emails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule emails",
      error: error.message,
    });
  }
};

// PATCH /api/notifications/clear-all
export const clearAllNotifications = async (req, res) => {
  try {
    await clearAllNotificationsForUser({ user: req.user });
    res.json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
      error: error.message,
    });
  }
};

// GET /api/notifications/queue-status
export const getQueueStatus = async (req, res) => {
  try {
    const status = getEmailQueueStatus();
    res.json({
      success: true,
      queueStatus: status,
    });
  } catch (error) {
    console.error("Error getting queue status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get queue status",
      error: error.message,
    });
  }
};

// GET /api/notifications/feed
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await fetchNotificationsForUser({
      user: req.user,
      limit: 100,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

// PATCH /api/notifications/read/:notificationId
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await markNotificationReadService({ notificationId, user: req.user });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification read:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark notification as read" });
  }
};

// PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    await markAllNotificationsReadService({ user: req.user });
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

// POST /api/notifications/send-grades-notification
export const sendGradesNotification = async (req, res) => {
  try {
    const { quizId, studentIds } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    const students = await User.find({
      _id: { $in: studentIds },
      role: "student",
    }).select("email firstName preferences.emailNotifications");

    const result = await notifyContentUpdate(
      "gradeRelease",
      {
        quiz: quiz.title,
        message:
          "Your grades have been released. Check your dashboard for details.",
      },
      students.map((s) => s.email),
      `${process.env.FRONTEND_URL}/quiz/${quizId}/results`,
    );

    res.json({
      success: true,
      message: `Grade notification sent to ${result.success} students`,
      details: result,
    });
  } catch (error) {
    console.error("Error sending grades notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send grades notification",
      error: error.message,
    });
  }
};

export default {
  sendQuizAnnouncement,
  scheduleQuizReminderEmail,
  sendQuizUpdateNotification,
  sendContentUpdateNotification,
  sendBulkAnnouncementEmail,
  scheduleEmails,
  getQueueStatus,
  sendGradesNotification,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

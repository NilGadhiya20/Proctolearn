import { Server } from 'socket.io';
import ActivityLog from '../models/ActivityLog.js';
import StudentSubmission from '../models/StudentSubmission.js';
import ActivityAnalyzer from '../utils/activityAnalyzer.js';
import { ACTIVITY_TYPES, ALERT_SEVERITY } from '../config/constants.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';

export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:5173'
      ],
      credentials: true
    }
  });
  // Helper: compute dashboard stats (optionally scoped by institution)
  const computeDashboardStats = async (institutionId) => {
    const userFilter = institutionId ? { institution: institutionId } : {};
    const quizFilter = institutionId ? { institution: institutionId } : {};

    const [facultyCount, studentCount, totalQuizzes, activeQuizzes] = await Promise.all([
      User.countDocuments({ ...userFilter, role: 'faculty' }),
      User.countDocuments({ ...userFilter, role: 'student' }),
      Quiz.countDocuments({ ...quizFilter }),
      Quiz.countDocuments({ ...quizFilter, status: { $in: ['active', 'published'] } })
    ]);

    return {
      faculty: facultyCount,
      students: studentCount,
      totalQuizzes,
      activeQuizzes
    };
  };

  // Track active quizzes
  const activeQuizzes = new Map();

  const normalizeActivityType = (rawType) => {
    const type = String(rawType || '').toLowerCase();

    if (['tab_switch', 'tab-switch', 'tab_change', 'shortcut_alt_tab', 'shortcut_ctrl_tab', 'shortcut_meta_tab'].includes(type)) {
      return ACTIVITY_TYPES.TAB_CHANGE;
    }

    if (['fullscreen_exit', 'fullscreen-exit'].includes(type)) {
      return ACTIVITY_TYPES.FULLSCREEN_EXIT;
    }

    if (['fullscreen_enter', 'fullscreen-enter'].includes(type)) {
      return ACTIVITY_TYPES.FULLSCREEN_ENTER;
    }

    if (['copy_attempt', 'copy', 'copy-paste', 'clipboard_blocked'].includes(type)) {
      return ACTIVITY_TYPES.COPY_ATTEMPT;
    }

    if (['paste_attempt', 'paste'].includes(type)) {
      return ACTIVITY_TYPES.PASTE_ATTEMPT;
    }

    if (['right_click', 'right-click', 'right_click_blocked'].includes(type)) {
      return ACTIVITY_TYPES.RIGHT_CLICK;
    }

    if (['keyboard_shortcut', 'clipboard_shortcut_blocked'].includes(type)) {
      return ACTIVITY_TYPES.KEYBOARD_SHORTCUT;
    }

    if (['window_blur'].includes(type)) {
      return ACTIVITY_TYPES.WINDOW_BLUR;
    }

    if (['page_visibility_change', 'window_close_attempt', 'page_refresh', 'browser_closed', 'beforeunload'].includes(type)) {
      return ACTIVITY_TYPES.PAGE_VISIBILITY_CHANGE;
    }

    return ACTIVITY_TYPES.KEYBOARD_SHORTCUT;
  };

  io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Join quiz room
    socket.on('join-quiz', (data) => {
      const { submissionId, quizId, studentId } = data;
      socket.join(`quiz-${quizId}`);
      if (submissionId) {
        socket.join(`submission-${submissionId}`);
      }

      if (submissionId && studentId && !activeQuizzes.has(submissionId)) {
        activeQuizzes.set(submissionId, {
          submissionId,
          quizId,
          studentId,
          socketId: socket.id,
          activities: [],
          joinedAt: new Date()
        });
      }

      console.log(`Student ${studentId} joined quiz ${quizId}`);
    });

    // Alias: joinQuiz for compatibility with clients using camelCase
    socket.on('joinQuiz', (payload) => {
      if (typeof payload === 'string' || typeof payload === 'number') {
        const quizId = payload;
        socket.join(`quiz-${quizId}`);
        console.log(`Joined quiz room ${quizId}`);
        return;
      }

      const { submissionId, quizId, studentId } = payload || {};
      if (quizId) {
        socket.join(`quiz-${quizId}`);
      }
      if (submissionId) {
        socket.join(`submission-${submissionId}`);
        if (!activeQuizzes.has(submissionId)) {
          activeQuizzes.set(submissionId, {
            submissionId,
            quizId,
            studentId,
            socketId: socket.id,
            activities: [],
            joinedAt: new Date()
          });
        }
      }
      console.log(`Student ${studentId} joined quiz ${quizId}`);
    });

    // Join admin dashboard room to receive live stats & activity
    socket.on('join-dashboard', async (data = {}) => {
      const { institutionId } = data;
      socket.join('admins');
      try {
        const stats = await computeDashboardStats(institutionId);
        socket.emit('dashboard-stats', { stats });
      } catch (err) {
        console.error('Error computing dashboard stats:', err);
      }
    });

    // Log student activity
    socket.on('activity', async (data) => {
      const { submissionId, quizId, activityType, details } = data;
      const studentName = data.studentName || 'Unknown Student';
      const studentEmail = data.studentEmail || 'No email';
      const normalizedActivityType = normalizeActivityType(activityType);

      try {
        // Save activity to database
        const activity = await ActivityLog.create({
          submission: submissionId,
          student: data.studentId,
          quiz: quizId,
          institution: data.institutionId,
          activityType: normalizedActivityType,
          severity: ActivityAnalyzer.getSeverityFromScore(0), // Initial severity
          description: `User performed: ${normalizedActivityType}`,
          timestamp: new Date(),
          details,
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        });

        // Add to active quiz activities
        const submission = activeQuizzes.get(submissionId);
        if (submission) {
          submission.activities.push(activity);
        }

        // Emit activity to faculty monitoring this quiz
        io.to(`quiz-${quizId}`).emit('activity-logged', {
          submissionId,
          studentId: data.studentId,
          studentName,
          studentEmail,
          activityType: normalizedActivityType,
          severity: activity.severity,
          timestamp: new Date()
        });

        // Broadcast lightweight activity feed for admins
        io.to('admins').emit('dashboard-activity', {
          type: activityType,
          normalizedType: normalizedActivityType,
          severity: activity.severity,
          quizId,
          submissionId,
          studentId: data.studentId,
          studentName,
          studentEmail,
          timestamp: new Date().toISOString()
        });

        // Instant faculty alerts for key proctoring events
        if (normalizedActivityType === ACTIVITY_TYPES.FULLSCREEN_EXIT) {
          io.to(`quiz-${quizId}`).emit('alert', {
            submissionId,
            studentId: data.studentId,
            studentName,
            studentEmail,
            alertType: 'FULLSCREEN_EXIT',
            severity: ALERT_SEVERITY.CRITICAL,
            activity: normalizedActivityType,
            score: 100,
            message: `${studentName} (${studentEmail}) exited fullscreen during quiz attempt`
          });

          io.to(`quiz-${quizId}`).emit('fullscreenExitDetected', {
            submissionId,
            studentId: data.studentId,
            studentName,
            studentEmail,
            timestamp: new Date().toISOString()
          });
        }

        if (normalizedActivityType === ACTIVITY_TYPES.TAB_CHANGE) {
          io.to(`quiz-${quizId}`).emit('alert', {
            submissionId,
            studentId: data.studentId,
            studentName,
            studentEmail,
            alertType: 'TAB_SWITCH',
            severity: ALERT_SEVERITY.HIGH,
            activity: normalizedActivityType,
            score: 80,
            message: `${studentName} (${studentEmail}) switched tab/window during quiz attempt`
          });

          io.to(`quiz-${quizId}`).emit('tabSwitchDetected', {
            submissionId,
            studentId: data.studentId,
            studentName,
            studentEmail,
            timestamp: new Date().toISOString()
          });
        }

        if (normalizedActivityType === ACTIVITY_TYPES.PAGE_VISIBILITY_CHANGE) {
          io.to(`quiz-${quizId}`).emit('alert', {
            submissionId,
            studentId: data.studentId,
            studentName,
            studentEmail,
            alertType: 'PAGE_REFRESH_OR_CLOSE_ATTEMPT',
            severity: ALERT_SEVERITY.HIGH,
            activity: normalizedActivityType,
            score: 75,
            message: `${studentName} (${studentEmail}) attempted page refresh/close or lost page visibility`
          });
        }

        // Check for suspicious activity score
        if ([ACTIVITY_TYPES.TAB_CHANGE, ACTIVITY_TYPES.FULLSCREEN_EXIT, ACTIVITY_TYPES.PAGE_VISIBILITY_CHANGE].includes(normalizedActivityType)) {
          const activities = submission?.activities || [];
          const suspicionScore = ActivityAnalyzer.calculateSuspicionScore(activities, 60);

          if (suspicionScore > 40) {
            io.to(`quiz-${quizId}`).emit('alert', {
              submissionId,
              studentId: data.studentId,
              studentName,
              studentEmail,
              alertType: 'SUSPICIOUS_ACTIVITY',
              severity: ActivityAnalyzer.getSeverityFromScore(suspicionScore),
              score: suspicionScore,
              activity: normalizedActivityType,
              message: `${studentName} (${studentEmail}) triggered suspicious activity`
            });
          }
        }

        // Optionally refresh stats for admins (cheap enough for now)
        try {
          const stats = await computeDashboardStats(data.institutionId);
          io.to('admins').emit('dashboard-stats', { stats });
        } catch (e) {
          // ignore stats refresh errors
        }
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    });

    // Monitor page visibility changes
    socket.on('visibility-change', async (data) => {
      const { submissionId, isVisible } = data;

      try {
        const activity = await ActivityLog.create({
          submission: submissionId,
          student: data.studentId,
          quiz: data.quizId,
          institution: data.institutionId,
          activityType: ACTIVITY_TYPES.PAGE_VISIBILITY_CHANGE,
          severity: !isVisible ? ALERT_SEVERITY.HIGH : ALERT_SEVERITY.LOW,
          description: !isVisible ? 'Page hidden - potential cheating' : 'Page visible again',
          timestamp: new Date(),
          details: { isVisible }
        });

        if (!isVisible) {
          io.to(`quiz-${data.quizId}`).emit('alert', {
            submissionId,
            studentId: data.studentId,
            alertType: 'PAGE_HIDDEN',
            severity: ALERT_SEVERITY.HIGH
          });
        }
      } catch (error) {
        console.error('Error in visibility change:', error);
      }
    });

    // Submit Quiz
    socket.on('submit-quiz', async (data) => {
      const { submissionId, quizId, answers } = data;

      try {
        const submission = await StudentSubmission.findByIdAndUpdate(
          submissionId,
          {
            status: 'submitted',
            submittedAt: new Date(),
            answers
          },
          { new: true }
        );

        io.to(`quiz-${quizId}`).emit('submission-complete', {
          submissionId,
          studentId: data.studentId,
          message: 'Quiz submitted successfully'
        });

        activeQuizzes.delete(submissionId);
        socket.leave(`submission-${submissionId}`);

        // Update dashboard stats and feed for admins
        try {
          const stats = await computeDashboardStats(data.institutionId);
          io.to('admins').emit('dashboard-stats', { stats });
          io.to('admins').emit('dashboard-activity', {
            type: 'SUBMISSION_COMPLETE',
            quizId,
            submissionId,
            studentId: data.studentId,
            timestamp: new Date().toISOString()
          });
        } catch (_) {}
      } catch (error) {
        console.error('Error submitting quiz:', error);
        socket.emit('error', { message: 'Failed to submit quiz' });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      activeQuizzes.forEach((value, key) => {
        if (value.socketId === socket.id) {
          activeQuizzes.delete(key);
        }
      });
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const initSocket = initializeSocketIO;
export default initializeSocketIO;

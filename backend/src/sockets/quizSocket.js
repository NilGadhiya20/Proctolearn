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

  io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Join quiz room
    socket.on('join-quiz', (data) => {
      const { submissionId, quizId, studentId } = data;
      socket.join(`quiz-${quizId}`);
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

      try {
        // Save activity to database
        const activity = await ActivityLog.create({
          submission: submissionId,
          student: data.studentId,
          quiz: quizId,
          institution: data.institutionId,
          activityType,
          severity: ActivityAnalyzer.getSeverityFromScore(0), // Initial severity
          description: `User performed: ${activityType}`,
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
          activityType,
          severity: activity.severity,
          timestamp: new Date()
        });

        // Broadcast lightweight activity feed for admins
        io.to('admins').emit('dashboard-activity', {
          type: activityType,
          severity: activity.severity,
          quizId,
          submissionId,
          studentId: data.studentId,
          timestamp: new Date().toISOString()
        });

        // Check for suspicious activity
        if ([ACTIVITY_TYPES.TAB_CHANGE, ACTIVITY_TYPES.FULLSCREEN_EXIT].includes(activityType)) {
          const activities = submission?.activities || [];
          const suspicionScore = ActivityAnalyzer.calculateSuspicionScore(activities, 60);

          if (suspicionScore > 40) {
            io.to(`quiz-${quizId}`).emit('alert', {
              submissionId,
              studentId: data.studentId,
              alertType: 'SUSPICIOUS_ACTIVITY',
              severity: ActivityAnalyzer.getSeverityFromScore(suspicionScore),
              score: suspicionScore,
              activity: activityType
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

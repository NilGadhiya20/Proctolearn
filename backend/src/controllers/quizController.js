import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import StudentSubmission from '../models/StudentSubmission.js';
import ActivityLog from '../models/ActivityLog.js';
import ExamSession from '../models/ExamSession.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { HTTP_STATUS, QUIZ_STATUS, SUBMISSION_STATUS } from '../config/constants.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { notifyNewQuiz } from '../services/emailNotificationService.js';

// Add Questions to a Quiz
export const addQuestionsToQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Questions array is required'
    });
  }

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Quiz not found' });
  }

  const docs = [];
  let totalMarks = quiz.totalMarks || 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: `Invalid question at index ${i}` });
    }

    const opts = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex }));

    const created = await Question.create({
      quiz: id,
      questionText: q.questionText,
      questionType: q.questionType || 'mcq',
      options: opts,
      marks: Number(q.marks) || 1,
      order: i + 1,
    });

    docs.push(created);
    totalMarks += Number(q.marks) || 1;
  }

  quiz.totalQuestions = (quiz.totalQuestions || 0) + docs.length;
  quiz.totalMarks = totalMarks;
  await quiz.save();

  res.status(HTTP_STATUS.CREATED).json({ success: true, data: { questions: docs, quiz } });
});

// Create Quiz
export const createQuiz = asyncHandler(async (req, res) => {
  const { title, description, duration, totalMarks, passingMarks, subject, chapter, attemptSettings, proctoring, accessWindow } = req.body;

  // Validation
  if (!title || !title.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz title is required and must not be empty'
    });
  }

  if (!duration || duration <= 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz duration must be greater than 0 minutes'
    });
  }

  if (totalMarks < 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Total marks cannot be negative'
    });
  }

  if (passingMarks < 0 || passingMarks > totalMarks) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Passing marks must be between 0 and total marks'
    });
  }

  // Validate attempt settings
  if (attemptSettings?.hasLimit && attemptSettings?.maxAttempts && (attemptSettings.maxAttempts < 1 || attemptSettings.maxAttempts > 10)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Maximum attempts must be between 1 and 10'
    });
  }

  const quiz = await Quiz.create({
    title: title.trim(),
    description: description?.trim() || '',
    duration: parseInt(duration),
    totalMarks: parseInt(totalMarks) || 0,
    passingMarks: parseInt(passingMarks) || 0,
    subject: subject?.trim() || '',
    chapter: chapter?.trim() || '',
    attemptSettings: attemptSettings || { hasLimit: false },
    institution: req.institutionId,
    createdBy: req.userId,
    status: QUIZ_STATUS.DRAFT,
    proctoring: proctoring || {
      enabled: true,
      requiresFullscreen: true,
      allowTabSwitching: false,
      allowMultipleWindows: false
    },
    accessWindow: accessWindow || {}
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Quiz created successfully. Add questions and publish to make it available.',
    data: quiz
  });
});

// Get All Quizzes
export const getAllQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, subject } = req.query;
  const skip = (page - 1) * limit;

  console.log('📋 getAllQuizzes called');
  console.log('   - institutionId:', req.institutionId);
  console.log('   - userId:', req.userId);
  console.log('   - userRole:', req.userRole);
  console.log('   - filters:', { status, subject });

  if (!req.institutionId) {
    console.error('❌ Institution ID not found in request');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Institution ID not found. Please ensure you are logged in.'
    });
  }

  const filter = {
    institution: req.institutionId,
    ...(subject && { subject })
  };

  // Role-based filtering
  if (req.userRole === 'faculty' || req.userRole === 'admin') {
    // Faculty/Admin see their own quizzes (all statuses if no status filter)
    filter.createdBy = req.userId;
    if (status) {
      filter.status = status;
    }
  } else if (req.userRole === 'student') {
    // Students only see PUBLISHED quizzes
    filter.status = 'published';
    if (status && status !== 'published') {
      // Student is trying to filter for non-published, return empty
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: [],
        pagination: { total: 0, page: parseInt(page), limit: parseInt(limit), pages: 0 }
      });
    }
  } else if (status) {
    filter.status = status;
  }

  console.log('🔍 Filter:', filter);

  const quizzes = await Quiz.find(filter)
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Quiz.countDocuments(filter);

  console.log(`✅ Found ${quizzes.length} quizzes`);
  if (quizzes.length > 0) {
    console.log('📋 First quiz sample:');
    console.log('   - ID:', quizzes[0]._id);
    console.log('   - ID type:', typeof quizzes[0]._id);
    console.log('   - Title:', quizzes[0].title);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: quizzes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get Quiz by ID
export const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid quiz ID format'
    });
  }

  const quiz = await Quiz.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedFaculty', 'firstName lastName email')
    .populate('assignedStudents', 'firstName lastName enrollmentNumber');

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: quiz
  });
});

// Update Quiz
export const updateQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, duration, totalMarks, passingMarks, status, attemptSettings, proctoring, subject, chapter, accessWindow } = req.body;

  const quiz = await Quiz.findById(id);

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check permissions: Faculty can only edit their own quizzes, Admin can edit all
  if (req.userRole === 'faculty' && quiz.createdBy.toString() !== req.userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to edit this quiz'
    });
  }

  // Validate attemptSettings if provided
  if (attemptSettings?.hasLimit && attemptSettings?.maxAttempts && (attemptSettings.maxAttempts < 1 || attemptSettings.maxAttempts > 10)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Maximum attempts must be between 1 and 10'
    });
  }

  // Update quiz fields
  if (title) quiz.title = title;
  if (description !== undefined) quiz.description = description;
  if (duration) quiz.duration = duration;
  if (totalMarks !== undefined) quiz.totalMarks = totalMarks;
  if (passingMarks !== undefined) quiz.passingMarks = passingMarks;
  if (status) quiz.status = status;
  if (attemptSettings) quiz.attemptSettings = attemptSettings;
  if (proctoring) quiz.proctoring = proctoring;
  if (subject !== undefined) quiz.subject = subject;
  if (chapter !== undefined) quiz.chapter = chapter;
  if (accessWindow) quiz.accessWindow = accessWindow;

  await quiz.save();

  // Emit real-time update via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.emit('quiz-updated', {
      quizId: quiz._id,
      quiz: quiz,
      updatedBy: req.user._id,
      timestamp: new Date()
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Quiz updated successfully',
    data: quiz
  });
});

// Delete Quiz
export const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id);

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check permissions: Faculty can only delete their own quizzes, Admin can delete all
  if (req.userRole === 'faculty' && quiz.createdBy.toString() !== req.userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to delete this quiz'
    });
  }

  // Delete associated questions
  await Question.deleteMany({ quiz: id });

  // Delete the quiz
  await quiz.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Quiz deleted successfully'
  });
});

// Publish Quiz
export const publishQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quiz = await Quiz.findById(id);

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check permissions: Faculty can only publish their own quizzes, Admin can publish all
  if (req.userRole === 'faculty' && quiz.createdBy.toString() !== req.userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to publish this quiz'
    });
  }

  // Validate quiz state before publishing
  if (quiz.status === QUIZ_STATUS.PUBLISHED) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz is already published'
    });
  }

  // Check if quiz has valid basic info
  if (!quiz.title || !quiz.title.trim()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz must have a title'
    });
  }

  if (!quiz.duration || quiz.duration <= 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz must have a valid duration'
    });
  }

  if (quiz.totalMarks < 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz must have valid marks'
    });
  }

  if (quiz.passingMarks < 0 || quiz.passingMarks > quiz.totalMarks) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Passing marks must be between 0 and total marks'
    });
  }

  // Check if quiz has questions
  const questionCount = await Question.countDocuments({ quiz: id });
  if (questionCount === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz must have at least one question before publishing'
    });
  }

  // Validate total question marks match or are reasonable
  const questions = await Question.find({ quiz: id });
  const totalQuestionMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  if (totalQuestionMarks === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Questions must have marks assigned'
    });
  }

  quiz.status = QUIZ_STATUS.PUBLISHED;
  await quiz.save();

  // Target students: assigned students if present, otherwise all students in the same institution
  const studentFilter = {
    institution: req.institutionId,
    role: 'student'
  };

  if (Array.isArray(quiz.assignedStudents) && quiz.assignedStudents.length > 0) {
    studentFilter._id = { $in: quiz.assignedStudents };
  }

  const targetStudents = await User.find(studentFilter)
    .select('_id email firstName preferences.emailNotifications')
    .lean();

  const quizDueDate =
    quiz?.accessWindow?.endDate ||
    quiz?.endTime ||
    (quiz?.startTime ? new Date(new Date(quiz.startTime).getTime() + quiz.duration * 60 * 1000) : new Date(Date.now() + quiz.duration * 60 * 1000));

  // Email is first priority; service already respects emailNotifications preference.
  const emailResult = await notifyNewQuiz(
    quiz._id,
    quiz.title,
    quiz.subject || 'General',
    quizDueDate,
    targetStudents
  );

  // In-app real-time notification to student dashboard (socket)
  const io = req.app.get('io');
  if (io) {
    const publishedBy = req.user?.firstName && req.user?.lastName
      ? `${req.user.firstName} ${req.user.lastName}`
      : 'Faculty';

    for (const student of targetStudents) {
      io.to(`student-${String(student._id)}`).emit('quiz-published-notification', {
        quizId: String(quiz._id),
        title: quiz.title,
        subject: quiz.subject || 'General',
        chapter: quiz.chapter || '',
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        publishedBy,
        publishedAt: new Date().toISOString(),
        dueDate: quizDueDate
      });
    }
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Quiz published successfully',
    data: quiz,
    notificationSummary: {
      targetedStudents: targetStudents.length,
      emailsSent: emailResult.success,
      emailsSkipped: emailResult.skipped || 0,
      emailFailures: emailResult.failed || 0
    }
  });
});

// Assign Students to Quiz
export const assignStudentsToQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body;

  const quiz = await Quiz.findByIdAndUpdate(
    id,
    { $addToSet: { assignedStudents: { $each: studentIds } } },
    { new: true }
  );

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Students assigned successfully',
    data: quiz
  });
});

// ========================================
// STUDENT QUIZ ATTEMPT APIs
// ========================================

// Get quiz for attempting (student view - includes questions)
export const getQuizForAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.userId;

  console.log('🎯 getQuizForAttempt called');
  console.log('   - Quiz ID param:', id);
  console.log('   - Type:', typeof id);
  console.log('   - Is valid ObjectId:', mongoose.Types.ObjectId.isValid(id));

  // Validate MongoDB ObjectId
  if (!id) {
    console.error('❌ Quiz ID is missing');
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz ID is required'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('❌ Invalid quiz ID format:', id);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid quiz ID format'
    });
  }

  const quiz = await Quiz.findById(id).populate('createdBy', 'firstName lastName');
  
  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check if quiz is published
  if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'This quiz is not available yet. It must be published by the faculty first.'
    });
  }

  // Check if quiz has questions
  const questionCount = await Question.countDocuments({ quiz: id });
  if (questionCount === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'This quiz has no questions yet'
    });
  }

  // Check quiz access window
  const now = new Date();
  if (quiz.accessWindow?.startDate && new Date(quiz.accessWindow.startDate) > now) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: `Quiz will be available from ${new Date(quiz.accessWindow.startDate).toLocaleString()}`
    });
  }

  if (quiz.accessWindow?.endDate && new Date(quiz.accessWindow.endDate) < now) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'The access window for this quiz has expired'
    });
  }

  // Check quiz scheduled time (if set)
  if (quiz.startTime && new Date(quiz.startTime) > now) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: `Quiz starts at ${new Date(quiz.startTime).toLocaleString()}`
    });
  }

  if (quiz.endTime && new Date(quiz.endTime) < now) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'This quiz has ended'
    });
  }

  // Check if student has already submitted (and attempts exhausted)
  // Default: unlimited attempts (no limit) if not specified
  const attemptSettings = quiz.attemptSettings || { hasLimit: false };
  const parsedMaxAttempts = Number(attemptSettings.maxAttempts);
  
  // Only enforce limit if hasLimit is explicitly true
  if (attemptSettings.hasLimit === true && Number.isInteger(parsedMaxAttempts) && parsedMaxAttempts > 0) {
    const existingSubmissions = await StudentSubmission.countDocuments({
      quiz: id,
      student: studentId,
      status: SUBMISSION_STATUS.SUBMITTED
    });

    console.log(`📊 Attempt check - Quiz: ${quiz._id}, Student: ${studentId}`);
    console.log(`   Existing submissions: ${existingSubmissions}, Max allowed: ${parsedMaxAttempts}`);

    if (existingSubmissions >= parsedMaxAttempts) {
      console.warn(`⚠️ Student ${studentId} has exhausted all ${parsedMaxAttempts} attempts for quiz ${quiz._id}`);
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `You have exhausted all ${parsedMaxAttempts} attempt(s) for this quiz`
      });
    }
  } else {
    console.log(`♾️ Unlimited attempts allowed for this quiz: ${quiz._id}`);
  }

  // Get or create submission
  let submission = await StudentSubmission.findOne({ 
    quiz: id, 
    student: studentId,
    status: SUBMISSION_STATUS.IN_PROGRESS
  });

  if (!submission) {
    submission = await StudentSubmission.create({
      quiz: id,
      student: studentId,
      institution: req.institutionId,
      status: SUBMISSION_STATUS.IN_PROGRESS,
      startedAt: new Date()
    });
    
    // Increment quiz total attempts
    await Quiz.findByIdAndUpdate(id, { $inc: { totalAttempts: 1 } });
  }

  // Get all questions for this quiz
  const questions = await Question.find({ quiz: id })
    .select('-correctAnswer')
    .sort({ order: 1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        proctoring: quiz.proctoring,
        createdBy: quiz.createdBy
      },
      submission: {
        _id: submission._id,
        startedAt: submission.startedAt,
        answers: submission.answers || []
      },
      questions
    }
  });
});

// Save individual question answer
export const saveQuestionAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionId, answer, flagged } = req.body;
  const studentId = req.userId;

  const submission = await StudentSubmission.findOne({
    quiz: id,
    student: studentId
  });

  if (!submission) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Submission not found'
    });
  }

  if (submission.status !== SUBMISSION_STATUS.IN_PROGRESS) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Cannot modify submitted quiz'
    });
  }

  // Find or create answer
  let answerIdx = submission.answers.findIndex(a => a.question.toString() === questionId);
  
  if (answerIdx >= 0) {
    submission.answers[answerIdx].answer = answer;
    submission.answers[answerIdx].answeredAt = new Date();
  } else {
    submission.answers.push({
      question: questionId,
      answer,
      answeredAt: new Date()
    });
  }

  // Handle flagged questions
  if (flagged) {
    if (!submission.flaggedAnswers.includes(questionId)) {
      submission.flaggedAnswers.push(questionId);
    }
  } else {
    submission.flaggedAnswers = submission.flaggedAnswers.filter(
      id => id.toString() !== questionId
    );
  }

  submission.updatedAt = new Date();
  await submission.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Answer saved',
    data: { submission }
  });
});

// Submit quiz
export const submitQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.userId;

  const submission = await StudentSubmission.findOne({
    quiz: id,
    student: studentId
  });

  if (!submission) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Submission not found'
    });
  }

  if (submission.status !== SUBMISSION_STATUS.IN_PROGRESS) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Quiz already submitted'
    });
  }

  submission.status = SUBMISSION_STATUS.SUBMITTED;
  submission.submittedAt = new Date();
  await submission.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: { submission }
  });
});

// Get student's submission (for viewing results/history)
export const getStudentSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.userId;

  const submission = await StudentSubmission.findOne({
    quiz: id,
    student: studentId
  }).populate({
    path: 'quiz',
    select: 'title subject totalMarks'
  });

  if (!submission) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'No submission found'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: submission
  });
});

// Get current student's all submissions
export const getStudentSubmissions = asyncHandler(async (req, res) => {
  const studentId = req.userId;

  const submissions = await StudentSubmission.find({
    student: studentId
  })
    .populate({
      path: 'quiz',
      select: '_id title subject totalMarks createdBy duration chapter description'
    })
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: submissions
  });
});

// ===========================
// FACULTY MONITORING APIs
// ===========================

// Get all submissions for a quiz (faculty view)
export const getQuizSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const submissions = await StudentSubmission.find({ quiz: id })
    .populate('student', 'firstName lastName enrollmentNumber email')
    .populate('quiz', 'title totalMarks')
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: submissions
  });
});

// Get activity logs for a submission (for monitoring)
export const getSubmissionActivityLogs = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  const logs = await ActivityLog.find({ submission: submissionId })
    .sort({ timestamp: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: logs
  });
});

// Start Exam Session - Initialize with security tracking
export const startExamSession = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user._id;

  // Validate MongoDB ObjectId
  if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid quiz ID format'
    });
  }

  // Only students can take exam
  if (req.user.role !== 'student') {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Only students can take exams'
    });
  }

  // Check if quiz exists
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check if quiz is published
  if (quiz.status !== QUIZ_STATUS.PUBLISHED) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Quiz is not available for attempt'
    });
  }

  // Check if student already has an ongoing session
  const existingSession = await ExamSession.findOne({
    student: userId,
    quiz: quizId,
    status: 'in-progress'
  });

  if (existingSession) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'You already have an ongoing exam session for this quiz',
      sessionId: existingSession._id
    });
  }

  // Create new exam session
  const examSession = await ExamSession.create({
    student: userId,
    quiz: quizId,
    startTime: new Date(),
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      browser: req.body.browser || 'Unknown'
    }
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Exam session started',
    data: {
      sessionId: examSession._id,
      quizDetails: {
        title: quiz.title,
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        totalQuestions: quiz.totalQuestions,
        passingMarks: quiz.passingMarks
      }
    }
  });
});

// Log Security Event - Track suspicious activities
export const logSecurityEvent = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { eventType, details } = req.body;
  const userId = req.user._id;

  const session = await ExamSession.findById(sessionId);
  if (!session) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Session not found'
    });
  }

  const student = await User.findById(userId).select('firstName lastName email institution');
  const studentName = `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Unknown Student';
  const studentEmail = student?.email || 'No email';
  const io = req.app.get('io');

  // Verify ownership
  if (session.student.toString() !== userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // Log the event based on type
  switch (eventType) {
    case 'tab-switch':
      session.securityFlags.tabSwitches += 1;
      break;
    case 'right-click':
      session.securityFlags.rightClickAttempts += 1;
      break;
    case 'copy-paste':
      session.securityFlags.copyPasteAttempts += 1;
      break;
    case 'fullscreen-exit':
      session.isFullscreenMaintained = false;
      break;
  }

  // Add to suspicious activities
  session.securityFlags.suspiciousActivities.push({
    activity: eventType,
    timestamp: new Date()
  });

  await session.save();

  if (io) {
    const payload = {
      submissionId: sessionId,
      studentId: userId,
      studentName,
      studentEmail,
      activityType: eventType,
      severity: eventType === 'fullscreen-exit' ? 'critical' : 'high',
      timestamp: new Date().toISOString()
    };

    io.to(`quiz-${session.quiz}`).emit('activity-logged', payload);

    if (eventType === 'tab-switch') {
      io.to(`quiz-${session.quiz}`).emit('alert', {
        ...payload,
        alertType: 'TAB_SWITCH',
        score: 80,
        message: `${studentName} (${studentEmail}) switched tab/window during exam`
      });

      io.to(`quiz-${session.quiz}`).emit('tabSwitchDetected', payload);
    }

    if (eventType === 'fullscreen-exit') {
      io.to(`quiz-${session.quiz}`).emit('alert', {
        ...payload,
        alertType: 'FULLSCREEN_EXIT',
        score: 100,
        message: `${studentName} (${studentEmail}) exited fullscreen during exam`
      });

      io.to(`quiz-${session.quiz}`).emit('fullscreenExitDetected', payload);
    }

    if (eventType === 'window-close-attempt' || eventType === 'page-refresh') {
      io.to(`quiz-${session.quiz}`).emit('alert', {
        ...payload,
        alertType: 'PAGE_REFRESH_OR_CLOSE_ATTEMPT',
        score: 75,
        message: `${studentName} (${studentEmail}) attempted page refresh/close`
      });
    }
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Event logged'
  });
});

// Submit Exam - Process answers and calculate score
export const submitExam = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!Array.isArray(answers)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Answers must be an array'
    });
  }

  const session = await ExamSession.findById(sessionId)
    .populate('quiz')
    .populate('student', 'firstName lastName email');

  if (!session) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Session not found'
    });
  }

  // Verify ownership
  if (session.student._id.toString() !== userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // Prevent double submission
  if (session.status !== 'in-progress') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'This exam session has already been submitted'
    });
  }

  // Get all questions for the quiz
  const questions = await Question.find({ quiz: session.quiz._id });
  let totalMarks = 0;
  let obtainedMarks = 0;
  const processedAnswers = [];

  // Process each answer
  for (const answer of answers) {
    const question = questions.find(q => q._id.toString() === answer.questionId);
    
    if (!question) continue;

    totalMarks += question.marks;

    // Find correct option
    const correctOption = question.options.find(opt => opt.isCorrect);
    const isCorrect = answer.selectedOption === correctOption?.text;

    if (isCorrect) {
      obtainedMarks += question.marks;
    }

    processedAnswers.push({
      questionId: question._id,
      selectedOption: answer.selectedOption,
      isCorrect: isCorrect,
      marksObtained: isCorrect ? question.marks : 0
    });
  }

  // Calculate percentage
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const isPassed = obtainedMarks >= session.quiz.passingMarks;

  // Update exam session
  session.answers = processedAnswers;
  session.totalMarks = totalMarks;
  session.obtainedMarks = obtainedMarks;
  session.percentage = percentage;
  session.endTime = new Date();
  session.timeSpent = Math.round((session.endTime - session.startTime) / 1000);
  session.status = 'submitted';

  await session.save();

  // Create/update student submission
  let submission = await StudentSubmission.findOne({
    student: userId,
    quiz: session.quiz._id
  });

  if (!submission) {
    submission = await StudentSubmission.create({
      student: userId,
      quiz: session.quiz._id,
      answers: processedAnswers,
      score: obtainedMarks,
      totalMarks: totalMarks,
      percentage: percentage,
      status: isPassed ? SUBMISSION_STATUS.PASSED : SUBMISSION_STATUS.FAILED,
      submittedAt: new Date()
    });
  } else {
    submission.answers = processedAnswers;
    submission.score = obtainedMarks;
    submission.totalMarks = totalMarks;
    submission.percentage = percentage;
    submission.status = isPassed ? SUBMISSION_STATUS.PASSED : SUBMISSION_STATUS.FAILED;
    submission.submittedAt = new Date();
    await submission.save();
  }

  // Update session with submission reference
  session.submission = submission._id;
  await session.save();

  // Log activity
  await ActivityLog.create({
    student: userId,
    quiz: session.quiz._id,
    submission: submission._id,
    action: 'submitted',
    details: {
      score: obtainedMarks,
      totalMarks: totalMarks,
      percentage: percentage,
      status: isPassed ? 'passed' : 'failed'
    },
    timestamp: new Date()
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Exam submitted successfully',
    data: {
      score: obtainedMarks,
      totalMarks: totalMarks,
      percentage: percentage.toFixed(2),
      status: isPassed ? 'passed' : 'failed',
      passingMarks: session.quiz.passingMarks,
      timeSpent: `${Math.floor(session.timeSpent / 60)}m ${session.timeSpent % 60}s`,
      securityDetails: {
        tabSwitches: session.securityFlags.tabSwitches,
        rightClickAttempts: session.securityFlags.rightClickAttempts,
        copyPasteAttempts: session.securityFlags.copyPasteAttempts,
        fullscreenMaintained: session.isFullscreenMaintained
      }
    }
  });
});

// Auto Submit Exam - Called when time ends
export const autoSubmitExam = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await ExamSession.findById(sessionId)
    .populate('quiz')
    .populate('student', 'firstName lastName email');

  if (!session) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Session not found'
    });
  }

  // Verify ownership
  if (session.student._id.toString() !== userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  // Prevent double submission
  if (session.status !== 'in-progress') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'This exam session has already been submitted'
    });
  }

  // Get all questions
  const questions = await Question.find({ quiz: session.quiz._id });
  let totalMarks = 0;
  let obtainedMarks = 0;
  const processedAnswers = [];

  // Use stored answers or default to empty
  const answers = session.answers && session.answers.length > 0 
    ? session.answers 
    : [];

  for (const question of questions) {
    totalMarks += question.marks;

    const storedAnswer = answers.find(a => a.questionId.toString() === question._id.toString());
    
    if (storedAnswer && storedAnswer.isCorrect) {
      obtainedMarks += question.marks;
    }

    processedAnswers.push({
      questionId: question._id,
      selectedOption: storedAnswer?.selectedOption || 'Not Answered',
      isCorrect: storedAnswer?.isCorrect || false,
      marksObtained: storedAnswer?.isCorrect ? question.marks : 0
    });
  }

  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
  const isPassed = obtainedMarks >= session.quiz.passingMarks;

  // Update session
  session.answers = processedAnswers;
  session.totalMarks = totalMarks;
  session.obtainedMarks = obtainedMarks;
  session.percentage = percentage;
  session.endTime = new Date();
  session.timeSpent = Math.round((session.endTime - session.startTime) / 1000);
  session.status = 'auto-submitted';
  session.autoSubmitted = true;

  await session.save();

  // Create/update student submission
  let submission = await StudentSubmission.findOne({
    student: userId,
    quiz: session.quiz._id
  });

  if (!submission) {
    submission = await StudentSubmission.create({
      student: userId,
      quiz: session.quiz._id,
      answers: processedAnswers,
      score: obtainedMarks,
      totalMarks: totalMarks,
      percentage: percentage,
      status: isPassed ? SUBMISSION_STATUS.PASSED : SUBMISSION_STATUS.FAILED,
      submittedAt: new Date()
    });
  } else {
    submission.answers = processedAnswers;
    submission.score = obtainedMarks;
    submission.totalMarks = totalMarks;
    submission.percentage = percentage;
    submission.status = isPassed ? SUBMISSION_STATUS.PASSED : SUBMISSION_STATUS.FAILED;
    submission.submittedAt = new Date();
    await submission.save();
  }

  session.submission = submission._id;
  await session.save();

  // Log activity
  await ActivityLog.create({
    student: userId,
    quiz: session.quiz._id,
    submission: submission._id,
    action: 'auto-submitted',
    details: {
      reason: 'Time ended',
      score: obtainedMarks,
      totalMarks: totalMarks,
      percentage: percentage
    },
    timestamp: new Date()
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Exam auto-submitted due to time ending',
    data: {
      score: obtainedMarks,
      totalMarks: totalMarks,
      percentage: percentage.toFixed(2),
      status: isPassed ? 'passed' : 'failed',
      autoSubmitted: true
    }
  });
});

// Get Exam Session Details
export const getExamSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user._id;

  const session = await ExamSession.findById(sessionId)
    .populate('student', 'firstName lastName email')
    .populate('quiz', 'title duration totalMarks')
    .populate('submission');

  if (!session) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Session not found'
    });
  }

  // Verify ownership
  if (session.student._id.toString() !== userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: session
  });
});

// Toggle Quiz Status (Activate/Deactivate)
export const toggleQuizStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status - draft, published and closed allowed
  const validStatuses = [QUIZ_STATUS.DRAFT, QUIZ_STATUS.PUBLISHED, QUIZ_STATUS.CLOSED];
  if (!status || !validStatuses.includes(status)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  const quiz = await Quiz.findById(id);

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check permissions: Faculty can only toggle their own quizzes, Admin can toggle all
  if (req.userRole === 'faculty' && quiz.createdBy.toString() !== req.userId.toString()) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You do not have permission to change this quiz status'
    });
  }

  const oldStatus = quiz.status;
  quiz.status = status;
  await quiz.save();

  // Emit real-time status update via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.emit('quiz-status-changed', {
      quizId: quiz._id,
      oldStatus,
      newStatus: status,
      quiz: quiz,
      changedBy: req.user._id,
      timestamp: new Date()
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Quiz status changed from ${oldStatus} to ${status}`,
    data: quiz
  });
});

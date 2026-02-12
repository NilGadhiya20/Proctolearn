import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import StudentSubmission from '../models/StudentSubmission.js';
import ActivityLog from '../models/ActivityLog.js';
import { HTTP_STATUS, QUIZ_STATUS, SUBMISSION_STATUS } from '../config/constants.js';
import { asyncHandler } from '../utils/errorHandler.js';

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
  const { title, description, duration, totalMarks, passingMarks, subject, chapter, proctoring, accessWindow } = req.body;

  const quiz = await Quiz.create({
    title,
    description,
    duration,
    totalMarks,
    passingMarks,
    subject,
    chapter,
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
    message: 'Quiz created successfully',
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
    ...(status && { status }),
    ...(subject && { subject })
  };

  console.log('🔍 Filter:', filter);

  const quizzes = await Quiz.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Quiz.countDocuments(filter);

  console.log(`✅ Found ${quizzes.length} quizzes`);

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
  const { title, description, duration, totalMarks, passingMarks, status, proctoring } = req.body;

  const quiz = await Quiz.findByIdAndUpdate(
    id,
    {
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      status,
      proctoring
    },
    { new: true, runValidators: true }
  );

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
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

  const quiz = await Quiz.findByIdAndDelete(id);

  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Delete associated questions
  await Question.deleteMany({ quiz: id });

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

  // Check if quiz has questions
  const questionCount = await Question.countDocuments({ quiz: id });
  if (questionCount === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Quiz must have at least one question'
    });
  }

  quiz.status = QUIZ_STATUS.PUBLISHED;
  await quiz.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Quiz published successfully',
    data: quiz
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

  const quiz = await Quiz.findById(id).populate('createdBy', 'firstName lastName');
  
  if (!quiz) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Quiz not found'
    });
  }

  // Check if quiz is active/published
  const now = new Date();
  if (quiz.startTime && new Date(quiz.startTime) > now) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Quiz has not started yet'
    });
  }

  if (quiz.endTime && new Date(quiz.endTime) < now) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Quiz has ended'
    });
  }

  // Get or create submission
  let submission = await StudentSubmission.findOne({ 
    quiz: id, 
    student: studentId 
  });

  if (!submission) {
    submission = await StudentSubmission.create({
      quiz: id,
      student: studentId,
      institution: req.institutionId,
      status: SUBMISSION_STATUS.IN_PROGRESS,
      startedAt: new Date()
    });
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
        createdBy: quiz.createdBy
      },
      submission: {
        _id: submission._id,
        startedAt: submission.startedAt
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

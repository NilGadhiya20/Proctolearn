import express from 'express';
import { 
  createQuiz, 
  getAllQuizzes, 
  getQuizById, 
  updateQuiz, 
  deleteQuiz, 
  publishQuiz, 
  assignStudentsToQuiz,
  addQuestionsToQuiz,
  getQuizForAttempt,
  saveQuestionAnswer,
  submitQuiz,
  getStudentSubmission,
  getStudentSubmissions,
  getQuizSubmissions,
  getSubmissionActivityLogs,
  startExamSession,
  logSecurityEvent,
  submitExam,
  autoSubmitExam,
  getExamSession,
  toggleQuizStatus
} from '../controllers/quizController.js';
import { auth, checkRole, verifyInstitutionAccess } from '../middleware/auth.js';
import { validateQuizCreation } from '../middleware/validation.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// Protected Routes - Only Faculty and Admin can manage quizzes
router.post('/', 
  auth, 
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess,
  validateQuizCreation, 
  createQuiz
);

router.get('/', 
  auth, 
  verifyInstitutionAccess, 
  getAllQuizzes
);

router.get('/:id', 
  auth, 
  verifyInstitutionAccess, 
  getQuizById
);

router.put('/:id', 
  auth, 
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess, 
  updateQuiz
);

router.delete('/:id', 
  auth, 
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess, 
  deleteQuiz
);

router.post('/:id/publish', 
  auth, 
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess, 
  publishQuiz
);

// Toggle quiz status (activate/deactivate)
router.patch('/:id/status', 
  auth, 
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess, 
  toggleQuizStatus
);

router.post('/:id/assign-students', 
  auth, 
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess, 
  assignStudentsToQuiz
);

router.post('/:id/questions',
  auth,
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess,
  addQuestionsToQuiz
);

// ========================
// Student Quiz Attempt APIs
// ========================

// Get quiz for attempting (includes all questions)
router.get('/:id/attempt',
  auth,
  checkRole(USER_ROLES.STUDENT),
  verifyInstitutionAccess,
  getQuizForAttempt
);

// Save individual question answer
router.post('/:id/answer',
  auth,
  checkRole(USER_ROLES.STUDENT),
  verifyInstitutionAccess,
  saveQuestionAnswer
);

// Submit quiz (finalize submission)
router.post('/:id/submit',
  auth,
  checkRole(USER_ROLES.STUDENT),
  verifyInstitutionAccess,
  submitQuiz
);

// Get student's submission
router.get('/:id/submission',
  auth,
  checkRole(USER_ROLES.STUDENT),
  verifyInstitutionAccess,
  getStudentSubmission
);

// Get current student's all submissions
router.get('/users/me/submissions',
  auth,
  checkRole(USER_ROLES.STUDENT),
  verifyInstitutionAccess,
  getStudentSubmissions
);

// ===========================
// FACULTY MONITORING APIs
// ===========================

// Get all submissions for a quiz (faculty view)
router.get('/:id/submissions',
  auth,
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess,
  getQuizSubmissions
);

// Get activity logs for a submission
router.get('/submission/:submissionId/logs',
  auth,
  checkRole(USER_ROLES.FACULTY, USER_ROLES.ADMIN),
  verifyInstitutionAccess,
  getSubmissionActivityLogs
);

// ===========================
// SECURE EXAM SESSION APIs
// ===========================

// Start exam session - Initialize with security tracking
router.post('/:quizId/exam/start',
  auth,
  checkRole(USER_ROLES.STUDENT),
  verifyInstitutionAccess,
  startExamSession
);

// Log security events (right-click, tab switch, copy-paste)
router.post('/exam/:sessionId/log-event',
  auth,
  checkRole(USER_ROLES.STUDENT),
  logSecurityEvent
);

// Submit exam with answers
router.post('/exam/:sessionId/submit',
  auth,
  checkRole(USER_ROLES.STUDENT),
  submitExam
);

// Auto submit exam (when time ends)
router.post('/exam/:sessionId/auto-submit',
  auth,
  checkRole(USER_ROLES.STUDENT),
  autoSubmitExam
);

// Get exam session details
router.get('/exam/:sessionId/details',
  auth,
  checkRole(USER_ROLES.STUDENT),
  getExamSession
);

export default router;

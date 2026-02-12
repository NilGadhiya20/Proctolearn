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
  getQuizSubmissions,
  getSubmissionActivityLogs
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

export default router;

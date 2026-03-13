// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    VERIFY: '/auth/verify',
    REFRESH: '/auth/refresh',
  },
  QUIZ: {
    GET_ALL: '/quizzes',
    GET_ONE: '/quizzes/:id',
    CREATE: '/quizzes',
    UPDATE: '/quizzes/:id',
    DELETE: '/quizzes/:id',
    SUBMIT: '/quizzes/:id/submit',
    GET_RESULTS: '/quizzes/:id/results',
  },
  USER: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    GET_ALL: '/users',
    DELETE: '/users/:id',
    CHANGE_PASSWORD: '/users/change-password',
  },
  SUBMISSION: {
    GET_ALL: '/quizzes/:id/submissions',
    GET_ONE: '/quizzes/submission/:id',
    GET_LOGS: '/quizzes/submission/:submissionId/logs',
    GRADE: '/quizzes/submission/:id/grade',
    FLAG: '/quizzes/submission/:id/flag',
  },
  SESSION: {
    START_EXAM: '/quizzes/:quizId/exam/start',
    LOG_EVENT: '/quizzes/exam/:sessionId/log-event',
    SUBMIT_EXAM: '/quizzes/exam/:sessionId/submit',
    AUTO_SUBMIT: '/quizzes/exam/:sessionId/auto-submit',
    GET_DETAILS: '/quizzes/exam/:sessionId/details',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

// Quiz Types
export const QUIZ_TYPES = {
  MCQ: 'mcq',
  SHORT_ANSWER: 'short_answer',
  LONG_ANSWER: 'long_answer',
  MIXED: 'mixed',
};

// Question Types
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  LONG_ANSWER: 'long_answer',
  ESSAY: 'essay',
  MATCHING: 'matching',
};

// Submission Status
export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  REVIEWED: 'reviewed',
  FLAGGED: 'flagged',
};

// Question Difficulty
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

// Proctoring Rules
export const PROCTORING_RULES = {
  REQUIRE_WEBCAM: 'require_webcam',
  REQUIRE_SCREEN_SHARING: 'require_screen_sharing',
  DISABLE_TAB_SWITCH: 'disable_tab_switch',
  DISABLE_COPY_PASTE: 'disable_copy_paste',
  REQUIRE_FACE_DETECTION: 'require_face_detection',
  REQUIRE_ID_VERIFICATION: 'require_id_verification',
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Logged in successfully',
    LOGOUT: 'Logged out successfully',
    CREATE: 'Created successfully',
    UPDATE: 'Updated successfully',
    DELETE: 'Deleted successfully',
    SUBMIT: 'Submitted successfully',
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    UNAUTHORIZED: 'You are not authorized',
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'Server error occurred',
    NETWORK_ERROR: 'Network error occurred',
  },
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Time Formats
export const TIME_FORMATS = {
  DATE: 'yyyy-MM-dd',
  TIME: 'HH:mm:ss',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  DATETIME_PRETTY: 'MMM d, yyyy h:mm a',
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  QUIZ_TYPES,
  QUESTION_TYPES,
  SUBMISSION_STATUS,
  DIFFICULTY_LEVELS,
  PROCTORING_RULES,
  MESSAGES,
  PAGINATION,
  TIME_FORMATS,
};

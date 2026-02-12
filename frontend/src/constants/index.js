// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student'
};

// Quiz Status
export const QUIZ_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVED: 'archived'
};

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  TRUE_FALSE: 'true_false'
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  FACULTY_DASHBOARD: '/faculty/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  MANAGE_USERS: '/admin/manage-users',
  CREATE_QUIZ: '/faculty/create-quiz',
  QUIZ_LIST: '/quiz-list',
  QUIZ_DETAILS: '/quiz/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
  PREFERENCES: 'preferences'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Time Constants (in ms)
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export default {
  API_CONFIG,
  USER_ROLES,
  QUIZ_STATUS,
  QUESTION_TYPES,
  ROUTES,
  STORAGE_KEYS,
  NOTIFICATION_TYPES,
  TIME_CONSTANTS,
  HTTP_STATUS
};

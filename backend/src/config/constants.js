// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
  EXTRA: 'extra'
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
  MULTIPLE_CHOICE: 'mcq',
  SHORT_ANSWER: 'short_answer',
  TRUE_FALSE: 'true_false',
  MULTIPLE_SELECT: 'multiple_select',
  ESSAY: 'essay'
};

// Submission Status
export const SUBMISSION_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  ABANDONED: 'abandoned'
};

// Activity Types for Monitoring
export const ACTIVITY_TYPES = {
  TAB_CHANGE: 'tab_change',
  FULLSCREEN_EXIT: 'fullscreen_exit',
  FULLSCREEN_ENTER: 'fullscreen_enter',
  COPY_ATTEMPT: 'copy_attempt',
  PASTE_ATTEMPT: 'paste_attempt',
  RIGHT_CLICK: 'right_click',
  KEYBOARD_SHORTCUT: 'keyboard_shortcut',
  WINDOW_BLUR: 'window_blur',
  PAGE_VISIBILITY_CHANGE: 'page_visibility_change'
};

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
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
  INTERNAL_ERROR: 500
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Time Limits
export const TOKEN_EXPIRY = '7d';
export const REFRESH_TOKEN_EXPIRY = '30d';
export const ACTIVITY_LOG_INTERVAL = 5000; // 5 seconds

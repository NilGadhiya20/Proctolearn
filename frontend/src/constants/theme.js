// Colors Palette
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6366f1',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#0ea5e9',
  LIGHT: '#f3f4f6',
  DARK: '#1f2937',
  GRAY: '#6b7280',
};

// Role Colors
export const ROLE_COLORS = {
  admin: '#ef4444',
  faculty: '#3b82f6',
  student: '#10b981',
};

// Status Colors
export const STATUS_COLORS = {
  active: '#10b981',
  inactive: '#6b7280',
  pending: '#f59e0b',
  blocked: '#ef4444',
  completed: '#10b981',
  failed: '#ef4444',
};

// Font Sizes
export const FONT_SIZES = {
  XS: '0.75rem',
  SM: '0.875rem',
  BASE: '1rem',
  LG: '1.125rem',
  XL: '1.25rem',
  '2XL': '1.5rem',
  '3XL': '1.875rem',
  '4XL': '2.25rem',
};

// Spacing
export const SPACING = {
  XS: '0.25rem',
  SM: '0.5rem',
  MD: '1rem',
  LG: '1.5rem',
  XL: '2rem',
  '2XL': '3rem',
  '3XL': '4rem',
};

// Border Radius
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.375rem',
  DEFAULT: '0.5rem',
  MD: '0.75rem',
  LG: '1rem',
  XL: '1.5rem',
  FULL: '9999px',
};

// Z-Index
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};

// Shadows
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Transitions
export const TRANSITIONS = {
  FAST: '150ms ease-in-out',
  BASE: '300ms ease-in-out',
  SLOW: '500ms ease-in-out',
};

export default {
  COLORS,
  ROLE_COLORS,
  STATUS_COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  Z_INDEX,
  SHADOWS,
  TRANSITIONS,
};

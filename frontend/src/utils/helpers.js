// Format Date
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
};

// Format Time Duration
export const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

// Validate Email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate Password
export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

// Format File Size
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Debounce Function
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle Function
export const throttle = (fn, limit = 1000) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Clone Deep Object
export const cloneDeep = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => cloneDeep(item));
  if (obj instanceof Object) {
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = cloneDeep(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

// Get initials from name
export const getInitials = (firstName = '', lastName = '') => {
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  return initials.replace(/\s/g, '');
};

// Generate random color
export const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A3E4D7'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get stored user
export const getStoredUser = () => {
  const userJson = localStorage.getItem('user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

// Check user role
export const hasRole = (requiredRole) => {
  const user = getStoredUser();
  return user && user.role === requiredRole;
};

// Check if has any role
export const hasAnyRole = (roles = []) => {
  const user = getStoredUser();
  return user && roles.includes(user.role);
};

export default {
  formatDate,
  formatDuration,
  isValidEmail,
  isValidPassword,
  formatFileSize,
  debounce,
  throttle,
  cloneDeep,
  getInitials,
  getRandomColor,
  isAuthenticated,
  getStoredUser,
  hasRole,
  hasAnyRole
};

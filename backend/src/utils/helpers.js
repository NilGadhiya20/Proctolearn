import { v4 as uuidv4 } from 'uuid';

// Generate unique ID
export const generateId = () => uuidv4();

// Pagination helper
export const getPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// Response formatter
export const formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    ...(data && { data }),
    statusCode
  };
};

// Error response
export const formatError = (message, statusCode = 500, errors = null) => {
  return {
    success: false,
    message,
    ...(errors && { errors }),
    statusCode
  };
};

// Check if value is empty
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Safe JSON parse
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return fallback;
  }
};

// Retry logic
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Rate limiting helper
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return (key) => {
    const now = Date.now();
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    requests.set(key, recentRequests);
    return true;
  };
};

export default {
  generateId,
  getPagination,
  formatResponse,
  formatError,
  isEmpty,
  safeJsonParse,
  retry,
  createRateLimiter
};

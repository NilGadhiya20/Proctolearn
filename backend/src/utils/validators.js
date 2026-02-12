// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password) => {
  if (password.length < 6) return false;
  return true;
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Validate quiz time
export const isValidQuizTime = (startTime, endTime, duration) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = (end - start) / (1000 * 60); // Convert to minutes
  return diff >= duration;
};

// Calculate pagination
export const getPaginationParams = (page, limit, maxLimit = 100) => {
  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(parseInt(limit) || 10, maxLimit);
  const skip = (currentPage - 1) * pageSize;
  return { skip, pageSize, currentPage };
};

// Format response
export const formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    statusCode,
    message,
    data
  };
};

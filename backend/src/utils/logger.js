const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS'
};

const colors = {
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  INFO: '\x1b[36m',
  DEBUG: '\x1b[35m',
  SUCCESS: '\x1b[32m',
  RESET: '\x1b[0m'
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const log = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const color = colors[level] || colors.INFO;
  const prefix = `${color}[${timestamp}] [${level}]${colors.RESET}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${prefix} ${message}`, data || '');
  } else {
    // For production, log in JSON format
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    console.log(JSON.stringify(logEntry));
  }
};

export const logger = {
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
  success: (message, data) => log(LOG_LEVELS.SUCCESS, message, data)
};

export default logger;

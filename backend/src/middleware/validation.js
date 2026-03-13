import { body, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../config/constants.js';

// Validation Error Handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User Registration Validation
export const validateUserRegistration = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('institutionCode').trim().notEmpty().withMessage('Institution code is required'),
  handleValidationErrors
];

// User Login Validation
export const validateUserLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Create Quiz Validation
export const validateQuizCreation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Quiz title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  
  body('duration')
    .toInt()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer (in minutes)'),
  
  body('totalMarks')
    .toInt()
    .isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
  
  body('passingMarks')
    .optional({ checkFalsy: false })
    .toInt()
    .isInt({ min: 0 }).withMessage('Passing marks must be a non-negative integer'),
  
  handleValidationErrors
];

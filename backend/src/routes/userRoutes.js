import { Router } from 'express';
import User from '../models/User.js';
import StudentSubmission from '../models/StudentSubmission.js';
import { auth, checkRole } from '../middleware/auth.js';
import { USER_ROLES, HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../utils/errorHandler.js';
import bcrypt from 'bcryptjs';

const router = Router();

// =========================
// Student Self-Service APIs
// =========================

// Get current student's submissions history
router.get('/me/submissions',
  auth,
  checkRole(USER_ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const submissions = await StudentSubmission.find({ student: req.userId })
      .populate({ path: 'quiz', select: 'title subject startTime endTime' })
      .select('score totalMarks status createdAt updatedAt quiz')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: submissions
    });
  })
);

// Update current user's profile (limited fields) - Available for all roles
router.patch('/profile',
  auth,
  asyncHandler(async (req, res) => {
    const allowed = ['firstName', 'lastName', 'phone', 'profilePicture', 'bio'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password').populate('institution');

    if (!updated) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated
    });
  })
);

// Get all users (Admin only)
router.get('/users',
  auth,
  checkRole(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    // Get user's institution from the logged-in user
    const currentUser = await User.findById(req.userId);
    
    const users = await User.find({ institution: currentUser.institution })
      .select('-password')
      .populate('institution')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: users
    });
  })
);

// Delete user (Admin only)
router.delete('/users/:id',
  auth,
  checkRole(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

// Update user (Admin only)
router.put('/users/:id',
  auth,
  checkRole(USER_ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, isActive },
      { new: true, runValidators: true }
    ).select('-password').populate('institution');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  })
);

export default router;

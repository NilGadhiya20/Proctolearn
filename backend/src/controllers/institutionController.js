import Institution from '../models/Institution.js';
import User from '../models/User.js';
import { HTTP_STATUS } from '../config/constants.js';
import { asyncHandler } from '../utils/errorHandler.js';

// Get All Institutions (Admin only)
export const getAllInstitutions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  const institutions = await Institution.find(filter)
    .populate('adminUser', 'name email role')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Institution.countDocuments(filter);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: institutions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get Institution by ID
export const getInstitutionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id)
    .populate('adminUser', 'name email role');

  if (!institution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Institution not found'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: institution
  });
});

// Create Institution
export const createInstitution = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    email,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
    website,
    description,
    departments,
    subscriptionPlan,
    subscriptionExpiry
  } = req.body;

  // Check if institution with same code or email exists
  const existingInstitution = await Institution.findOne({
    $or: [{ code }, { email }]
  });

  if (existingInstitution) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Institution with same code or email already exists'
    });
  }

  const institution = await Institution.create({
    name,
    code: code.toUpperCase(),
    email,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
    website,
    description,
    departments,
    subscriptionPlan: subscriptionPlan || 'free',
    subscriptionExpiry,
    isActive: true
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Institution created successfully',
    data: institution
  });
});

// Update Institution
export const updateInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id);

  if (!institution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Institution not found'
    });
  }

  // Check if updating code or email conflicts with another institution
  if (req.body.code || req.body.email) {
    const conflict = await Institution.findOne({
      _id: { $ne: id },
      $or: [
        ...(req.body.code ? [{ code: req.body.code.toUpperCase() }] : []),
        ...(req.body.email ? [{ email: req.body.email }] : [])
      ]
    });

    if (conflict) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'Institution with same code or email already exists'
      });
    }
  }

  // Update fields
  Object.keys(req.body).forEach(key => {
    if (key === 'code') {
      institution[key] = req.body[key].toUpperCase();
    } else if (key !== 'adminUser' && key !== '_id') {
      institution[key] = req.body[key];
    }
  });

  await institution.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Institution updated successfully',
    data: institution
  });
});

// Delete Institution
export const deleteInstitution = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id);

  if (!institution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Institution not found'
    });
  }

  // Check if there are users associated with this institution
  const usersCount = await User.countDocuments({ institution: id });

  if (usersCount > 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Cannot delete institution. ${usersCount} users are still associated with it.`
    });
  }

  await institution.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Institution deleted successfully'
  });
});

// Toggle Institution Active Status
export const toggleInstitutionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id);

  if (!institution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Institution not found'
    });
  }

  institution.isActive = !institution.isActive;
  await institution.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Institution ${institution.isActive ? 'activated' : 'deactivated'} successfully`,
    data: institution
  });
});

// Get Institution Statistics
export const getInstitutionStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const institution = await Institution.findById(id);

  if (!institution) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Institution not found'
    });
  }

  const [usersCount, facultyCount, studentsCount] = await Promise.all([
    User.countDocuments({ institution: id }),
    User.countDocuments({ institution: id, role: 'faculty' }),
    User.countDocuments({ institution: id, role: 'student' })
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      institution: institution.name,
      totalUsers: usersCount,
      faculty: facultyCount,
      students: studentsCount,
      totalQuizzes: institution.totalQuizzes || 0,
      subscriptionPlan: institution.subscriptionPlan,
      isActive: institution.isActive
    }
  });
});

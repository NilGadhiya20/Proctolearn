import express from 'express';
import {
  getAllInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  toggleInstitutionStatus,
  getInstitutionStats
} from '../controllers/institutionController.js';
import { auth, checkRole } from '../middleware/auth.js';
import { USER_ROLES } from '../config/constants.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);
router.use(checkRole(USER_ROLES.ADMIN));

// Institution CRUD
router.get('/', getAllInstitutions);
router.get('/:id', getInstitutionById);
router.post('/', createInstitution);
router.put('/:id', updateInstitution);
router.delete('/:id', deleteInstitution);

// Institution Status & Stats
router.patch('/:id/toggle-status', toggleInstitutionStatus);
router.get('/:id/stats', getInstitutionStats);

export default router;

import express from 'express';
import * as experienceController from '../controllers/experienceController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', experienceController.getAllExperience);

// Protected routes (admin only)
router.post('/', verifyToken, experienceController.createExperience);
router.put('/:id', verifyToken, experienceController.updateExperience);
router.delete('/:id', verifyToken, experienceController.deleteExperience);

export default router;

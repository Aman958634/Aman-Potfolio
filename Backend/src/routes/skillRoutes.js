import express from 'express';
import * as skillController from '../controllers/skillController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', skillController.getAllSkills);

// Protected routes (admin only)
router.post('/', verifyToken, skillController.createSkill);
router.put('/:id', verifyToken, skillController.updateSkill);
router.delete('/:id', verifyToken, skillController.deleteSkill);

export default router;

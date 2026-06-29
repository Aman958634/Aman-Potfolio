import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', projectController.getAllProjects);
router.post('/seed', verifyToken, projectController.seedDefaultProjects);
router.get('/:id', projectController.getProjectById);

// Protected routes (admin only)
router.post('/', verifyToken, projectController.createProject);
router.put('/:id', verifyToken, projectController.updateProject);
router.delete('/:id', verifyToken, projectController.deleteProject);

export default router;

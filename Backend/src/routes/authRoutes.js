import express from 'express';
import { loginAdmin, seedAdmin } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/seed', verifyToken, seedAdmin);

export default router;

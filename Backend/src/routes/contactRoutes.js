import express from 'express';
import * as contactController from '../controllers/contactController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public route - submit contact form
router.post('/', contactController.submitContact);

// Protected routes (admin only)
router.post('/test-email', verifyToken, contactController.testEmail);
router.post('/:id/resend-email', verifyToken, contactController.resendContactEmail);
router.get('/', verifyToken, contactController.getAllContacts);
router.delete('/:id', verifyToken, contactController.deleteContact);

export default router;

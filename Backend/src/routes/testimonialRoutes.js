import express from 'express';
import * as testimonialController from '../controllers/testimonialController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', testimonialController.getAllTestimonials);
router.get('/:id', testimonialController.getTestimonialById);
router.post('/', verifyToken, testimonialController.createTestimonial);
router.put('/:id', verifyToken, testimonialController.updateTestimonial);
router.delete('/:id', verifyToken, testimonialController.deleteTestimonial);

export default router;

import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', analyticsController.getAllAnalytics);
router.get('/:id', analyticsController.getAnalyticsById);
router.post('/', verifyToken, analyticsController.createAnalytics);
router.put('/:id', verifyToken, analyticsController.updateAnalytics);
router.delete('/:id', verifyToken, analyticsController.deleteAnalytics);

export default router;

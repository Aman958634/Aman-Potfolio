import express from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', verifyToken, serviceController.createService);
router.put('/:id', verifyToken, serviceController.updateService);
router.delete('/:id', verifyToken, serviceController.deleteService);

export default router;

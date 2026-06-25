import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, userController.getAllUsers);
router.post('/', verifyToken, userController.createUser);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser);

export default router;

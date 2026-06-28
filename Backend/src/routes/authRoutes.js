import { Router } from 'express';
import { loginAdmin, seedAdmin } from '../controllers/authController.js';

const router = Router();

router.post('/test', (req, res) => {
  return res.json({ success: true, message: 'auth route works' });
});

router.post('/login', loginAdmin);
router.post('/seed', seedAdmin);

export default router;

import { Router } from 'express';
import { login, seedAdmin } from '../controllers/authController.js';

const router = Router();

router.get('/test', (req, res) => {
  return res.json({ success: true, message: 'auth working' });
});

router.post('/login', login);
router.post('/seed', seedAdmin);

export default router;

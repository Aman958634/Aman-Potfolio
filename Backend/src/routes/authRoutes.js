import { Router } from 'express';
import { loginAdmin, seedAdmin } from '../controllers/authController.js';

const router = Router();

router.get('/test', (req, res) => {
  res.json({ success: true, route: 'auth working' });
});

router.post('/login', loginAdmin);
router.post('/seed', seedAdmin);

export default router;

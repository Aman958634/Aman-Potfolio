import { Router } from 'express';
import { login, seedAdmin } from '../controllers/authController.js';

console.log('AUTH ROUTES FILE LOADED', import.meta.url);

const router = Router();

router.get('/test', (req, res) => {
  return res.json({ success: true, message: 'auth working' });
});

const routeList = ['/test', '/routes', '/login', '/seed'];

router.get('/routes', (req, res) => {
  return res.json({
    success: true,
    routes: routeList
  });
});

router.post('/login', login);
router.post('/seed', seedAdmin);

console.log('AUTH ROUTES REGISTERED', routeList.join(', '));

export default router;

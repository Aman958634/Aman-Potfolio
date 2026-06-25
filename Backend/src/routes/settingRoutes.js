import express from 'express';
import * as settingController from '../controllers/settingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', settingController.getAllSettings);
router.get('/:key', settingController.getSettingByKey);
router.post('/', verifyToken, settingController.createSetting);
router.put('/:key', verifyToken, settingController.updateSetting);
router.delete('/:key', verifyToken, settingController.deleteSetting);

export default router;

import express from 'express';
import * as sectionController from '../controllers/sectionController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', sectionController.getAllSections);
router.get('/:slug', sectionController.getSectionBySlug);
router.post('/', verifyToken, sectionController.createSection);
router.put('/:slug', verifyToken, sectionController.updateSection);
router.delete('/:slug', verifyToken, sectionController.deleteSection);

export default router;

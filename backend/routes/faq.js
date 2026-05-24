import { Router } from 'express';
import { getAllFAQs, getFAQById } from '../controllers/faqController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getAllFAQs);
router.get('/:id', protect, getFAQById);

export default router;

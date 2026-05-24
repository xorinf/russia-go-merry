import { Router } from 'express';
import { getAllFAQs, getFAQById } from '../controllers/faqController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// GET /api/faq — Fetch all FAQs (which are neatly grouped by category in your controller)
// Protected: Requires a valid JWT token
router.get('/', protect, getAllFAQs);

// GET /api/faq/:id — Fetch a single FAQ by its unique database ID
// Protected: Requires a valid JWT token
router.get('/:id', protect, getFAQById);

export default router;

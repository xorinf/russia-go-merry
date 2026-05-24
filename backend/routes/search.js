import { Router } from 'express';
import { semanticSearch, getTrending } from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, semanticSearch);
router.get('/trending', protect, getTrending);

export default router;

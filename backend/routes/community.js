import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  toggleUpvote,
  addComment,
  resolvePost,
} from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getAllPosts);
router.get('/:id', protect, getPostById);
router.post('/', protect, createPost);
router.post('/:id/upvote', protect, toggleUpvote);
router.post('/:id/comments', protect, addComment);
router.patch('/:id/resolve', protect, resolvePost);

export default router;

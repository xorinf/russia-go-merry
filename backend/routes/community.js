import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  toggleUpvote,
  addComment,
  resolvePost,
  deletePost,
} from '../controllers/communityController.js';
import { searchCommunityPosts } from '../controllers/communitySearchController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/search', protect, searchCommunityPosts);

router.get('/', protect, getAllPosts);
router.get('/:id', protect, getPostById);
router.post('/', protect, createPost);
router.post('/:id/upvote', protect, toggleUpvote);
router.post('/:id/comments', protect, addComment);
router.patch('/:id/resolve', protect, resolvePost);
router.delete('/:id', protect, authorize('admin', 'moderator'), deletePost);

export default router;
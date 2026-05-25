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

// GET /api/community — Fetch all community posts, sorted by newest (Protected)
router.get('/', protect, getAllPosts);

// GET /api/community/:id — Fetch a single post and its embedded comments by ID (Protected)
router.get('/:id', protect, getPostById);

// POST /api/community — Create a new community question/post (Protected)
router.post('/', protect, createPost);

// POST /api/community/:id/upvote — Add or remove the current user's upvote on a post (Protected)
router.post('/:id/upvote', protect, toggleUpvote);

// POST /api/community/:id/comments — Submit a new comment on a specific post (Protected)
router.post('/:id/comments', protect, addComment);

// PATCH /api/community/:id/resolve — Mark a post as answered and attach the official solution (Protected)
router.patch('/:id/resolve', protect, resolvePost);

export default router;

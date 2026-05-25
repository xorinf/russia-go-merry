import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register (Public)
// Creates a new user account and returns an initial auth token
router.post('/register', register);

// POST /api/auth/login (Public)
// Authenticates an existing user and returns a fresh auth token
router.post('/login', login);

// GET /api/auth/me (Protected)
// Uses the 'protect' middleware to verify the token before fetching the user's profile
router.get('/me', protect, getMe);

export default router;

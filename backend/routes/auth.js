import { Router } from 'express';
import { login, register, getMe, getAllUsers, updateUserRole } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

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

// GET /api/auth/users (Protected: Admin only)
router.get('/users', protect, authorize('admin'), getAllUsers);

// PATCH /api/auth/users/:id/role (Protected: Admin only)
router.patch('/users/:id/role', protect, authorize('admin'), updateUserRole);

export default router;

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper: Generates a signed JWT using the user's ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate that all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    // 2. Check if a user with this email already exists to prevent duplicates
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // 3. Create the new user in the database (password hashing should be handled in the User model)
    const user = await User.create({
      name,
      email,
      password,
    });

    // 4. Generate an auth token for immediate login after registration
    const token = generateToken(user._id);

    // 5. Send back the token and sanitized user data (excluding password)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Find the user by email. Note: explicitly selecting '+password' if it's hidden by default in the model
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' }); // Keep error generic for security
    }

    // 3. Compare the provided password with the hashed password in the DB
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Passwords match; generate a new auth token
    const token = generateToken(user._id);

    // 5. Send back the token and sanitized user data
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  // Returns the current user's data. 
  // Note: This relies on a protected route middleware that verifies the JWT and attaches the user to `req.user` beforehand.
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const adminOnly = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (!['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Express middleware to protect routes requiring authentication
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract the token from the Authorization header (expected format: 'Bearer <token>')
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Reject the request immediately if no token is found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized. No token provided.' });
  }

  try {
    // 3. Verify the token using your secret key (this throws an error if it's invalid or expired)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Fetch the user from the database using the decoded ID, explicitly excluding the password
    req.user = await User.findById(decoded.id).select('-password');

    // 5. Reject if the token is valid but the user was deleted from the database
    if (!req.user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // 6. Successfully authenticated: attach the user object to the request and move to the next function
    next();
  } catch (error) {
    // 7. Catch block handles any token verification failures
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

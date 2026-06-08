import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: Protects private routes by verifying JWT in the Authorization header
 * Expects header format: Authorization: Bearer <token>
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header string (split by space: ["Bearer", "TOKEN"])
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify token using the JWT_SECRET from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret123');

      // Fetch user profile from the database based on the decoded token ID
      // Omit the password field from the attached user data object for security
      req.user = await User.findById(decoded.id).select('-password');
      
      // If no user matches the ID, deny authorization
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Pass control to the next middleware or controller endpoint
      return next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  // Fallback check if token is completely missing in request headers
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

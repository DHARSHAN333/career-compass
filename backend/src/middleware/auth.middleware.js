import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      logger.error(`JWT verification failed: ${jwtError.message}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

export default authenticate;

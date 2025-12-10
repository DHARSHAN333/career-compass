import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: '7d'
  });
};

// Register new user
export const register = async (req, res) => {
  try {
    // Check MongoDB connection
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database not available. Please configure MongoDB to use authentication.',
        details: 'Visit MongoDB Atlas and whitelist your IP address, or install MongoDB locally.'
      });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { username, email, contactNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { contactNumber }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
      if (existingUser.contactNumber === contactNumber) {
        return res.status(400).json({
          success: false,
          error: 'Contact number already registered'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
    }

    // Create new user
    const user = new User({
      username,
      email,
      contactNumber,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          contactNumber: user.contactNumber
        },
        token
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Check MongoDB connection
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        error: 'Database not available. Please configure MongoDB to use authentication.',
        details: 'Visit MongoDB Atlas and whitelist your IP address, or install MongoDB locally.'
      });
    }

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          contactNumber: user.contactNumber
        },
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error(`Get current user error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user data'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

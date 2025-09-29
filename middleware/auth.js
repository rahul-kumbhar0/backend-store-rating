const jwt = require('jsonwebtoken');
const { User } = require('../models');

// In middleware/auth.js - updated protect function
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token ? 'Present' : 'Missing');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('Token decoded:', decoded);

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      console.log('User from DB:', req.user);

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'SYSTEM_ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

// Store owner middleware
const storeOwner = (req, res, next) => {
  if (req.user && req.user.role === 'STORE_OWNER') {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as store owner' });
  }
};

module.exports = { protect, admin, storeOwner };
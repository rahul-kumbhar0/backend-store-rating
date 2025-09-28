const express = require('express');
const { protect, storeOwner } = require('../middleware/auth');
const { 
  getStoreRatings, 
  getStoreDashboard,
  changePassword
} = require('../controllers/storeOwnerController');

const router = express.Router();

// Apply authentication and store owner middleware to all routes
router.use(protect);
router.use(storeOwner);

// Dashboard
router.get('/dashboard', getStoreDashboard);

// Ratings for the store
router.get('/ratings', getStoreRatings);

// Password management
router.put('/change-password', changePassword);

module.exports = router;
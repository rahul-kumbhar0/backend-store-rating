const express = require('express');
const { protect, admin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const { registerValidation, storeValidation } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use((req, res, next) => {
  console.log('User in request:', req.user);
  console.log('User role:', req.user ? req.user.role : 'No user');
  next();
});
router.use(admin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', registerValidation, adminController.createUser);

// Stores
router.get('/stores', adminController.getStores);
router.post('/stores', storeValidation, adminController.createStore);

module.exports = router;
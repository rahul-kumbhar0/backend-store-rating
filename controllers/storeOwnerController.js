const { Store, Rating, User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// @desc    Get store owner dashboard
// @route   GET /api/store-owner/dashboard
// @access  Private/Store Owner
const getStoreDashboard = async (req, res) => {
  try {
    // Find store owned by this user
    const store = await Store.findOne({
      where: { ownerId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    // Get all ratings for this store
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Calculate average rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(2) : '0.00';

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      },
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      recentRatings: ratings.slice(0, 10) // Last 10 ratings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get ratings for store owner's store
// @route   GET /api/store-owner/ratings
// @access  Private/Store Owner
const getStoreRatings = async (req, res) => {
  try {
    // Find store owned by this user
    const store = await Store.findOne({
      where: { ownerId: req.user.id }
    });

    if (!store) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    // Get all ratings for this store with user details
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change store owner password
// @route   PUT /api/store-owner/change-password
// @access  Private/Store Owner
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Get user with password
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 8 || newPassword.length > 16) {
      return res.status(400).json({ message: 'Password must be between 8 and 16 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStoreDashboard,
  getStoreRatings,
  changePassword
};
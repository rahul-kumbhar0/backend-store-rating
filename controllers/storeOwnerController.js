const { Store, Rating, User } = require('../models');
const bcrypt = require('bcryptjs');


// @desc    Get store owner dashboard
// @route   GET /api/store-owner/dashboard
// @access  Private/Store Owner
const getStoreDashboard = async (req, res) => {
  try {
    console.log('=== STORE OWNER DASHBOARD DEBUG ===');
    console.log('1. Request user:', req.user);
    console.log('2. User ID from token:', req.user.id);
    console.log('3. User role from token:', req.user.role);
    
    // Let's check what stores exist in the database
    const allStores = await Store.findAll({
      attributes: ['id', 'name', 'ownerId']
    });
    console.log('4. All stores in DB:', allStores.map(s => ({
      id: s.id,
      name: s.name,
      ownerId: s.ownerId
    })));
    
    // Let's check what users exist as store owners
    const storeOwners = await User.findAll({
      where: { role: 'STORE_OWNER' },
      attributes: ['id', 'name', 'role']
    });
    console.log('5. All store owners:', storeOwners);
    
    // Now let's search for stores owned by this user
    console.log('6. Searching for store with ownerId =', req.user.id);
    
    const store = await Store.findOne({
      where: { ownerId: req.user.id }
    });
    
    console.log('7. Store found by ownerId:', store);
    
    if (!store) {
      // Let's do a more thorough search
      console.log('8. Doing thorough search...');
      
      // Check if there are ANY stores with ownerId not null
      const storesWithOwners = await Store.findAll({
        where: {
          ownerId: {
            [require('sequelize').Op.not]: null
          }
        }
      });
      console.log('9. Stores with owners:', storesWithOwners);
      
      return res.status(404).json({ 
        message: 'No store found for this owner',
        debug: {
          userId: req.user.id,
          userName: req.user.name,
          userRole: req.user.role,
          totalStoresInDB: allStores.length,
          storesWithOwners: storesWithOwners.length,
          searchedOwnerId: req.user.id
        }
      });
    }
    
    console.log('10. Found store, now getting ratings...');
    
    // Get all ratings for this store
    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('11. Ratings found:', ratings.length);
    
    // Calculate average rating
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = ratings.length > 0 ? (totalRating / ratings.length).toFixed(2) : '0.00';
    
    const result = {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      },
      averageRating: parseFloat(averageRating),
      totalRatings: ratings.length,
      recentRatings: ratings.slice(0, 10)
    };
    
    console.log('12. Final result:', result);
    res.json(result);
    
  } catch (error) {
    console.error('Store dashboard error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
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
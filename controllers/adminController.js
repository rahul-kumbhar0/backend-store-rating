const { Op } = require('sequelize');
const { User, Store, Rating } = require('../models');
const bcrypt = require('bcryptjs');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { name, email, role, address, sortBy, order } = req.query;
    const whereClause = {};

    // Apply filters if provided
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (role) whereClause.role = role;
    if (address) whereClause.address = { [Op.like]: `%${address}%` };

    // Sorting
    const allowedUserSort = ['name', 'email', 'role', 'address', 'createdAt'];
    const sortColumn = allowedUserSort.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [[sortColumn, sortOrder]]
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Store,
        as: 'ownedStore',
        attributes: ['id', 'name', 'email', 'address']
      }]
    });

    if (user) {
      // If user is a store owner, calculate their store rating
      if (user.role === 'STORE_OWNER' && user.ownedStore) {
        const ratings = await Rating.findAll({
          where: { storeId: user.ownedStore.id }
        });
        
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
        
        user.dataValues.storeRating = averageRating.toFixed(2);
      }
      
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      role: role || 'NORMAL_USER'
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all stores
// @route   GET /api/admin/stores
// @access  Private/Admin
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, order } = req.query;
    const whereClause = {};

    // Apply filters if provided
    if (name) whereClause.name = { [Op.like]: `%${name}%` };
    if (email) whereClause.email = { [Op.like]: `%${email}%` };
    if (address) whereClause.address = { [Op.like]: `%${address}%` };

    // Base fetch with owner include
    const stores = await Store.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email']
      }]
    });

    // Compute average ratings
    const storesWithRatings = await Promise.all(stores.map(async (store) => {
      const ratings = await Rating.findAll({ where: { storeId: store.id } });
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

      return {
        ...store.toJSON(),
        averageRating: Number(averageRating.toFixed(2))
      };
    }));

    // Sorting
    const sortKey = sortBy || 'createdAt';
    const sortDir = (order && order.toUpperCase() === 'ASC') ? 1 : -1;

    const sorted = [...storesWithRatings].sort((a, b) => {
      if (sortKey === 'averageRating') {
        return (a.averageRating - b.averageRating) * sortDir;
      }
      if (a[sortKey] == null && b[sortKey] == null) return 0;
      if (a[sortKey] == null) return -1 * sortDir;
      if (b[sortKey] == null) return 1 * sortDir;
      if (typeof a[sortKey] === 'string') {
        return a[sortKey].localeCompare(b[sortKey]) * sortDir;
      }
      if (a[sortKey] > b[sortKey]) return 1 * sortDir;
      if (a[sortKey] < b[sortKey]) return -1 * sortDir;
      return 0;
    });

    res.json(sorted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create store
// @route   POST /api/admin/stores
// @access  Private/Admin
const createStore = async (req, res) => {
  const { name, email, address } = req.body;

  try {
    // Check if store exists
    const storeExists = await Store.findOne({ where: { email } });

    if (storeExists) {
      return res.status(400).json({ message: 'Store already exists with this email' });
    }

    // Create store
    const store = await Store.create({
      name,
      email,
      address
    });

    if (store) {
      res.status(201).json(store);
    } else {
      res.status(400).json({ message: 'Invalid store data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// assign owner to a store
// @desc    Assign owner to store
// @route   PUT /api/admin/stores/:id/owner
// @access  Private/Admin
const assignStoreOwner = async (req, res) => {
  try {
    const { ownerId } = req.body;
    const storeId = req.params.id;

    console.log('=== Assign Store Owner ===');
    console.log('Store ID:', storeId);
    console.log('Owner ID:', ownerId);

    // Check if user exists and is a store owner
    const user = await User.findByPk(ownerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'STORE_OWNER') {
      return res.status(400).json({ message: 'User must be a store owner' });
    }

    // Update store with ownerId
    const [updatedRows] = await Store.update(
      { ownerId: ownerId },
      { where: { id: storeId } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Verify the update
    const updatedStore = await Store.findByPk(storeId);
    console.log('Updated store:', updatedStore);

    res.json({ 
      message: 'Store owner assigned successfully',
      store: updatedStore
    });
  } catch (error) {
    console.error('Assign store owner error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
  assignStoreOwner
};
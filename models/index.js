const sequelize = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Make sure all models are initialized before setting up associations
const initModels = () => {
  // Define associations
  User.hasMany(Rating, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });

  Store.hasMany(Rating, {
    foreignKey: 'storeId',
    onDelete: 'CASCADE'
  });

  Rating.belongsTo(User, {
    foreignKey: 'userId'
  });

  Rating.belongsTo(Store, {
    foreignKey: 'storeId'
  });

  // For store ownership - CORRECTED ASSOCIATIONS
  User.hasOne(Store, {
    foreignKey: 'ownerId',
    as: 'ownedStore',
    onDelete: 'SET NULL'
  });

  Store.belongsTo(User, {
    foreignKey: 'ownerId',
    as: 'owner',
    onDelete: 'SET NULL'
  });
};

// Initialize models
initModels();

// Sync all models
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database & tables synced!');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = {
  sequelize,
  User,
  Store,
  Rating
};
const {DataTypes} = require('sequelize');
const sequelize = require('../config/db')

const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Updated to match tableName
        key: 'id'
      }
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stores', // Updated to match tableName
        key: 'id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    timestamps: true,
    tableName: 'ratings',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'storeId']
      }
    ]
  });

module.exports = Rating;
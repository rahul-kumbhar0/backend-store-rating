const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [20, 60],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isValidPassword(value) {
        if (!/[A-Z]/.test(value)) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          throw new Error('Password must contain at least one special character');
        }
      }
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [0, 400]
    }
  },
  role: {
    type: DataTypes.ENUM('SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'),
    allowNull: false,
    defaultValue: 'NORMAL_USER'
  }
}, {
  tableName: 'users'
});

module.exports = User;
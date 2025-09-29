const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define('Store', {
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
            notEmpty: true,
            notNull: true
        }
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User, // Use model object
            key: 'id'
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
    address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 400]
        }
    }
}, {
    timestamps: true,
    tableName: 'stores'
});
module.exports = Store;
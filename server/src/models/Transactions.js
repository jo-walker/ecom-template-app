const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    items: {
        type: DataTypes.JSON, 
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'credit', 'debit'),
        allowNull: false,
    },
    cash_received: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    change: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'transactions', // Explicitly set the table name here
    timestamps: false, // Automatically handle createdAt and updatedAt fields
});

module.exports = Transaction;
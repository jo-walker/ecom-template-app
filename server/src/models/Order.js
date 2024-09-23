const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  userId: DataTypes.INTEGER,  // You can link this to a User model if needed
  totalAmount: DataTypes.FLOAT,
  status: DataTypes.STRING,  // E.g., "pending", "completed"
});

module.exports = Order;

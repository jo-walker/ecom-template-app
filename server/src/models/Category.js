const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories', // Ensure the reference points to the correct table
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'Categories', // Make sure the table name is pluralized correctly
});

module.exports = Category;
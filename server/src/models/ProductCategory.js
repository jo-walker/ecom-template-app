const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductCategory = sequelize.define('ProductCategory', {
  product_sku: {
    type: DataTypes.STRING(15),
    references: {
      model: 'Product',
      key: 'SKU',
    },
    onDelete: 'CASCADE', // If the product is deleted, the relationship is also deleted
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Category',
      key: 'id',
    },
    onDelete: 'CASCADE', // If the category is deleted, the relationship is also deleted
  },
}, {
  timestamps: false, // Disable timestamps
});

module.exports = ProductCategory;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const ProductCategory = require('./ProductCategory');

const Product = sequelize.define('Product', {
  SKU: {
    type: DataTypes.STRING(15), // SKU length set to 15 characters
    primaryKey: true,           // Set SKU as the primary key
    allowNull: false,           // Ensures SKU is provided
    unique: true,               // Ensures SKU is unique
  },
  UPC: {
    type: DataTypes.STRING(12),
    unique: true,               // Ensure UPC is unique
  },
  EAN: {
    type: DataTypes.STRING(13),
    unique: true,               // Ensure EAN is unique
  },
  description: {
    type: DataTypes.JSON,        // JSON to store multilingual product descriptions
        // Example JSON: { color: 'black', material: 'wool', description: 'woman legging' }

  },
  vendor: {
    type: DataTypes.JSON,        // JSON for vendor/supplier information
  },
  selling_price: {
    type: DataTypes.JSON,        // JSON for retail, wholesale, etc.
  },
  stock: {
    type: DataTypes.JSON,        // JSON for stock information (quantity, available, reserved)
  },
  size: {
    type: DataTypes.JSON,        // JSON for dimensions (width, height, depth)
  },
  linked_pictures: {
    type: DataTypes.JSON,        // JSON for linked images with attributes
  },
  history: {
    type: DataTypes.JSON,        // JSON for tracking changes (date, user, action)
  },
  status: {
    type: DataTypes.STRING(50),  // Product status (e.g., active, discontinued)
  }
}, {
  timestamps: false, // Disable timestamps as we track changes manually in history
});

async function associateCategoryWithProduct(product, categoryName) {
    const category = await Category.findOne({ where: { name: categoryName } });
    if (category) {
      await ProductCategory.create({ product_sku: product.SKU, category_id: category.id });
    } else {
      console.error(`Category not found: ${categoryName}`);
    }
  }
module.exports = Product;
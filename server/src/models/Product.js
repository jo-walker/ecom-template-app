const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    barcode: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      unique: true,
      comment:
        "Auto-generated: CategoryCode + StyleNumber + SizeCode + ColorCode",
    },
    category_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: "Categories",
        key: "code",
      },
    },
    style_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    size_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: "Sizes",
        key: "code",
      },
    },
    color_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      references: {
        model: "Colors",
        key: "code",
      },
    },

    // Vendor & Pricing
    vendor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    vendor_sku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Vendor's product code",
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    retail_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    initial_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // Additional Info
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of image URLs",
    },

    // Clover Export Tracking
    exported_to_clover: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Has this product been exported to Clover?",
    },
    last_exported_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When was this product last exported to Clover?",
    },
    clover_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Clover system ID after import",
    },
  },
  {
    tableName: "Products",
    timestamps: true,
  }
);

module.exports = Product;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sale = sequelize.define(
  "Sale",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    barcode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: "Products",
        key: "barcode",
      },
      comment: "Product barcode",
    },
    quantity_sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
      comment: "Number of units sold in this transaction",
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Price per unit at time of sale",
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Total sale amount (quantity_sold * unit_price)",
    },
    sale_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "When the sale occurred",
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Cash, Card, etc.",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Additional sale notes",
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "External transaction/receipt ID",
    },
  },
  {
    tableName: "Sales",
    timestamps: true,
    indexes: [
      {
        fields: ["barcode"],
      },
      {
        fields: ["sale_date"],
      },
    ],
  }
);

module.exports = Sale;

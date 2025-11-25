const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Color = sequelize.define(
  "Color",
  {
    code: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    hex_value: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: "Color hex code, e.g., #000000",
    },
  },
  {
    tableName: "Colors",
    timestamps: true,
  }
);

module.exports = Color;

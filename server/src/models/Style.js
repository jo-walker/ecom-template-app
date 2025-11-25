const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Style = sequelize.define(
  "Style",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "Styles",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["category_code", "style_number"],
      },
    ],
  }
);

module.exports = Style;

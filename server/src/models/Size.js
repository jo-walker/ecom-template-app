const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Size = sequelize.define(
  "Size",
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
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "Display order: 0=Free Size, 1=XS, 2=S, etc.",
    },
  },
  {
    tableName: "Sizes",
    timestamps: true,
  }
);

module.exports = Size;

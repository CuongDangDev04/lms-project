const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Receipt = sequelize.define(
  "Receipt",
  {
    receipt_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: "receipts",
    timestamps: false,
  }
);

module.exports = Receipt;

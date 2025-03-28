const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ReceiptDetail = sequelize.define(
  "ReceiptDetail",
  {
    participate_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    receipt_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: "receipt_details",
    timestamps: false,
  }
);

module.exports = ReceiptDetail;

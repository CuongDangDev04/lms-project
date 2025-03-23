// models/Notification.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    notification_type: {
      type: DataTypes.ENUM("tag", "system", "classroom"),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.TINYINT(1),
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Notification;

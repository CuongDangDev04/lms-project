const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserNotification = sequelize.define(
  "user_notification",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = UserNotification;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserParticipation = sequelize.define(
  "user_participation",
  {
    participate_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classroom_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    timestamps: false,
  }
);
module.exports = UserParticipation;

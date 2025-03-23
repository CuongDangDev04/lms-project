const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserParticipation = sequelize.define(
  "User_participation",
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
    tableName: "User_participations",
  }
);
module.exports = UserParticipation;

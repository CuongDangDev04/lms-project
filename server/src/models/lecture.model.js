const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Lecture = sequelize.define(
  "Lecture",
  {
    lecture_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_participation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lecture_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    timestamps: false,
  }
);

module.exports = Lecture;
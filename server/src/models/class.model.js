const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Class = sequelize.define(
  "Class",
  {
    class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "classes",
  }
);

module.exports = Class;

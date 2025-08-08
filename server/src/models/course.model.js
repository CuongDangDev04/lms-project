const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
// test
const default_img = 'https://ibb.co/QjJ5p3ng'
//test
const Course = sequelize.define(
  "Course",
  {
    course_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    course_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    course_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    course_img: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: default_img
    }
  },
  {
    timestamps: false,
    tableName: "courses"
  }
);

module.exports = Course;

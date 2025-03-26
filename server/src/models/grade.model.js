const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Grade = sequelize.define(
  "Grade",
  {
    grade_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    submission_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Liên kết với bài nộp
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Liên kết với bài tập (để dễ tra cứu)
    },
    score: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT, // Nhận xét từ giáo viên
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "Grades",
  }
);

module.exports = Grade;
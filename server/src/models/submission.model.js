const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Submission = sequelize.define(
  "submission",
  {
    submission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Liên kết với bài tập
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // ID của sinh viên nộp bài
    },
    file_path: {
      type: DataTypes.STRING(500), // Đường dẫn file bài nộp (JSON nếu nhiều file)
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Thời gian nộp bài
    },
    status: {
      type: DataTypes.ENUM("pending", "graded"), // Trạng thái: đang chờ hoặc đã chấm
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    timestamps: false,
    tableName: "submissions",
  }
);

module.exports = Submission;
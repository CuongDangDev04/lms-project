const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define(
  "Schedule",
  {
    schedule_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    weekdays: {
      type: DataTypes.ENUM("2", "3", "4", "5", "6", "7", "8"),
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    exam_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_postponed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    makeup_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    parent_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Schedules",
        key: "schedule_id",
      },
    },
    classroom_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "classrooms",
        key: "classroom_id",
      },
    },
  },
  {
    tableName: "Schedules",
    timestamps: false,
  }
);

module.exports = Schedule;
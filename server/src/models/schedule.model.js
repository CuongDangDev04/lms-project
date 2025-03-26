const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define(
  "Schedule",
  {
    schedule_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weekdays: {
      type: DataTypes.ENUM("2", "3", "4", "5", "6", "7", "8"), // 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday, 7 = Saturday, 8 = Sunday
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
      defaultValue: false,
      allowNull: false,
    },
    makeup_date: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
    },
    parent_schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Schedules',
        key: 'schedule_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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

Schedule.belongsTo(Schedule, {
  as: 'parentSchedule',
  foreignKey: 'parent_schedule_id',
});

module.exports = Schedule;
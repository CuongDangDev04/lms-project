const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Assignment = sequelize.define(
  "assignment",
  {
    assignment_id: {
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
    start_assignment: {
      type: DataTypes.DATE, 
      allowNull: true,
    },
    end_assignment: {
      type: DataTypes.DATE,  
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_path: {
      type: DataTypes.STRING(500), 
      allowNull: true,
    }
  },
  {
    timestamps: false, 
  }
);

module.exports = Assignment;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Question = sequelize.define(
    'Question',
    {
        question_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: 'questions',
        timestamps: false,
    }
);

module.exports = Question;
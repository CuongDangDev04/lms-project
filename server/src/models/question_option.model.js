const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuestionOption = sequelize.define(
    'QuestionOption',
    {
        option_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'questions',
                key: 'question_id',
            },
        },
        content: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        is_correct: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: 'question_options',
        timestamps: false,
    }
);

module.exports = QuestionOption;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ExamQuestion = sequelize.define(
    'ExamQuestion',
    {
        exam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'exams',
                key: 'exam_id',
            },
        },
        question_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'questions',
                key: 'question_id',
            },
        },
    },
    {
        tableName: 'exam_questions',
        timestamps: false,
    }
);

module.exports = ExamQuestion;
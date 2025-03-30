const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');


const ExamProgress = sequelize.define(
    'ExamProgress',
    {
        exam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'exams',
                key: 'exam_id',
            },
        },
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        start_time: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        answers: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {},
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'exam_progress',
        timestamps: false,
    }
);



module.exports = ExamProgress;
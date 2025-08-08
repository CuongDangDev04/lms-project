const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Result = sequelize.define(
    'Result',
    {
        result_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'exams',
                key: 'exam_id',
            },
        },
        participate_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user_participations',
                key: 'participate_id',
            },
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        submitted_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'results',
        timestamps: false,
    }
);

module.exports = Result;
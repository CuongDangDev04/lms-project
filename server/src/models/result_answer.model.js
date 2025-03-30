const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ResultAnswer = sequelize.define(
    'ResultAnswer',
    {
        result_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'results',
                key: 'result_id',
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
        selected_option_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'question_options',
                key: 'option_id',
            },
        },
    },
    {
        tableName: 'result_answers',
        timestamps: false,
    }
);

module.exports = ResultAnswer;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Exam = sequelize.define(
    'Exam',
    {
        exam_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        classroom_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'classrooms',
                key: 'classroom_id',
            },
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60,
            validate: {
                min: 1
            }
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW 
        },
        deadline: {  
            type: DataTypes.DATE,
            allowNull: false, 
            validate: {
                isAfterStart(value) {
                    if (new Date(value) <= new Date(this.start_time)) {
                        throw new Error('Deadline must be after start_time');
                    }
                },
            },
        },
        hide_results: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'exams',
        timestamps: false,
    }
);

module.exports = Exam;
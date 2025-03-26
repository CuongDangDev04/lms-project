const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ClassStatus = sequelize.define(
    "Class_statuses",
    {
        status_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        status_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false
    }
);
module.exports = ClassStatus;

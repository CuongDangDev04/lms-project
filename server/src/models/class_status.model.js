const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ClassStatus = sequelize.define(
    "class_status",
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
        timestamps: false,
        tableName: "class_status",
    }
);
module.exports = ClassStatus;

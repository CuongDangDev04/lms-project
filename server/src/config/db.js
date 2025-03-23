const { Sequelize } = require("sequelize");
const fs = require("fs");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.PRODUCTION_DB_USER,
  process.env.PRODUCTION_DB_PASS,
  {
    host: process.env.PRODUCTION_DB_HOST,
    port: process.env.PRODUCTION_DB_PORT,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync("./ca.pem"),
        rejectUnauthorized: true,
      },
    },
  }
);

module.exports = sequelize;
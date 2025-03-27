const { Sequelize } = require("sequelize");
require("dotenv").config();
const fs = require("fs");

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.PRODUCTION_DB_USER,
//   process.env.PRODUCTION_DB_PASS,
//   {
//     host: process.env.PRODUCTION_DB_HOST,
//     port: process.env.PRODUCTION_DB_PORT,
//     dialect: "mysql",
//     dialectOptions: {
//       ssl: {
//         ca: fs.readFileSync("./ca.pem"),
//         rejectUnauthorized: true,
//       },
//     },
//   }
// );
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;

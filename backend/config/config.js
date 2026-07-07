// // config.js
// require("dotenv").config();

// module.exports = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//   },
//   test: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//   },
// };

// config.js
require("dotenv").config();

const commonConfig = {
  dialect: "mysql",
  timezone: "+05:30", // Set Sri Lanka timezone
  define: {
    timestamps: true, // Enable Sequelize timestamps
    createdAt: "created_at", // Map createdAt
    updatedAt: "updated_at", // Map updatedAt
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
};

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    ...commonConfig,
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    ...commonConfig,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    ...commonConfig,
  },
};

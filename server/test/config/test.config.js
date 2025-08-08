// Test environment configuration
const path = require('path');
const dotenv = require('dotenv');
const { sequelize } = require('../../src/models');

// Load env variables for test
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Database setup helpers
const setupTestDB = async () => {
  // Use a test database or in-memory database
  try {
    // Check connection
    await sequelize.authenticate();
    console.log('Test database connection established successfully.');
    
    // In test environment, you might want to sync with { force: true } 
    // to recreate tables, but be careful with this in shared test databases
    // await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Unable to connect to the test database:', error);
    throw error;
  }
};

const teardownTestDB = async () => {
  try {
    await sequelize.close();
    console.log('Test database connection closed.');
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
};

module.exports = {
  setupTestDB,
  teardownTestDB
};

// Main test file to organize all tests
const { setupTestDB, teardownTestDB } = require('./config/test.config');

describe('LMS Backend Test Suite', () => {
  // Global setup for all tests
  before(async () => {
    console.log('Setting up test environment...');
    try {
      await setupTestDB();
    } catch (error) {
      console.error('Failed to set up test environment:', error);
      process.exit(1);
    }
  });
  
  // Global teardown for all tests
  after(async () => {
    console.log('Tearing down test environment...');
    try {
      await teardownTestDB();
    } catch (error) {
      console.error('Failed to tear down test environment:', error);
    }
  });
  
  // Import and organize all test suites
  describe('Unit Tests', () => {
    describe('Controllers', () => {
      require('./unit/controllers/submissionController.test');
      require('./unit/controllers/courseController.test');
      // Add more controller tests as needed
    });
    
    describe('Middlewares', () => {
      require('./unit/middlewares/validateID.test');
      require('./unit/middlewares/uploadMiddleware.test');
      // Add more middleware tests as needed
    });
    
    // Add more unit test categories as needed
  });
  
  describe('Integration Tests', () => {
    require('./integration/auth.test');
    // Add more integration tests as needed
  });
});

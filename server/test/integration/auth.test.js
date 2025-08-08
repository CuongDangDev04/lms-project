const chai = require('chai');
const chaiHttp = require('chai-http');
const bcrypt = require('bcryptjs');
const { expect } = chai;
const { User } = require('../../src/models');
const app = require('../../src/server');
const sequelize = require('../../src/config/db');

chai.use(chaiHttp);

describe('Auth Controller - Integration Tests', () => {
  let server;
  let testUser;

  before(async function () {
    this.timeout(15000);

    try {
      // Start the server
      server = await new Promise((resolve) => {
        const s = app.listen(0, () => {
          console.log(`Test server started on port ${s.address().port}`);
          resolve(s);
        });
      });

      // Create the User table directly without syncing all models
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await User.sync({ force: true });
      
      // Create test user
      const hashedPassword = await bcrypt.hash('testPassword123', 10);
      testUser = await User.create({
        username: 'auth_test_user',
        email: 'auth_test@example.com',
        password: hashedPassword,
        fullname: 'Test User',
        role_id: 1,
        user_status: true
      });
      
      console.log('Test user created successfully:', testUser.username);
    } catch (error) {
      console.error('Failed to setup test environment:', error);
      throw error;
    }
  });

  after(async function () {
    this.timeout(10000);
    try {
      // Clean up test data
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await User.destroy({ where: {}, force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      
      // Close server
      if (server) {
        await new Promise((resolve) => server.close(resolve));
        console.log('Test server closed.');
      }
    } catch (error) {
      console.error('Failed to tear down test environment:', error);
    }
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          username: 'auth_test_user',
          password: 'testPassword123'
        });
      
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('loginToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('username', 'auth_test_user');
    });
    
    it('should not login with invalid username', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          username: 'invalid_user',
          password: 'testPassword123'
        });
      
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message');
    });
    
    it('should not login with invalid password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({
          username: 'auth_test_user',
          password: 'wrongPassword'
        });
      
      expect(res).to.have.status(400);
      expect(res.body).to.have.property('message');
    });
  });
});
// test/utils/test.utils.js
const { sequelize } = require('../../src/config/db');
const { User } = require('../../src/models/index');

async function createTestUser(userData) {
  return await User.create(userData);
}

async function cleanupTestData() {
  // Xóa các bảng theo thứ tự ngược với phụ thuộc khóa ngoại
  await sequelize.models.Document.destroy({ where: {}, truncate: true }); // Nếu có bảng Document
  await sequelize.models.UserParticipation.destroy({ where: {}, truncate: true }); // Nếu có bảng UserParticipation
  await sequelize.models.User.destroy({ where: {}, truncate: true }); // Xóa User sau cùng
}

module.exports = { createTestUser, cleanupTestData };
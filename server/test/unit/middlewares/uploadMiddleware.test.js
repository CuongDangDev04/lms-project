// test/unit/middlewares/uploadMiddleware.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uploadAssignment = require('../../../src/middlewares/uploadAssignment');

describe('Upload Middleware - Unit Tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('uploadAssignment middleware', () => {
    it('should be a multer instance', () => {
      // Kiểm tra xem uploadAssignment là một đối tượng multer hợp lệ
      expect(uploadAssignment).to.be.an('object');
      expect(uploadAssignment).to.have.property('storage');
      // Không dùng instanceof trực tiếp với multer.StorageEngine, thay vào đó kiểm tra cấu trúc
      expect(uploadAssignment.storage).to.have.property('getDestination');
      expect(uploadAssignment.storage).to.have.property('getFilename');
    });

    it('should have proper upload directory setup', () => {
      // Stub fs.existsSync và fs.mkdirSync để kiểm tra logic tạo thư mục
      const uploadDirPath = path.join(__dirname, '../../../src/middlewares/uploads/assignment');
      const existsStub = sandbox.stub(fs, 'existsSync').returns(false);
      const mkdirStub = sandbox.stub(fs, 'mkdirSync');

      // Gọi lại require để kích hoạt logic (xóa cache nếu cần)
      delete require.cache[require.resolve('../../../src/middlewares/uploadAssignment')];
      require('../../../src/middlewares/uploadAssignment');

      expect(existsStub.calledWith(uploadDirPath)).to.be.true;
      expect(mkdirStub.calledWith(uploadDirPath, { recursive: true })).to.be.true;
    });
  });
});
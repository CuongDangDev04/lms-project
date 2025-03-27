const { expect } = require('chai');
const sinon = require('sinon');
const { validateId } = require('../../../src/middlewares/validateID');

describe('ValidateID Middleware - Unit Tests', () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it('should successfully validate ID and return record', async () => {
    // Mock model and data
    const mockRecord = { id: 1, name: 'Test Record' };
    const mockModel = {
      findByPk: sandbox.stub().resolves(mockRecord)
    };
    
    // Call the validateId function
    const result = await validateId(1, mockModel, 'TestModel');
    
    // Verify the result
    expect(mockModel.findByPk.calledOnce).to.be.true;
    expect(mockModel.findByPk.calledWith(1)).to.be.true;
    expect(result).to.deep.equal(mockRecord);
  });
  
  it('should throw error when ID is not an integer', async () => {
    // Mock model
    const mockModel = {
      findByPk: sandbox.stub()
    };
    
    try {
      await validateId('abc', mockModel, 'TestModel');
      // If we reach here, the test should fail
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.include('Không tồn tại');
      expect(mockModel.findByPk.called).to.be.false;
    }
  });
  
  it('should throw error when record is not found', async () => {
    // Mock model returning null (record not found)
    const mockModel = {
      findByPk: sandbox.stub().resolves(null)
    };
    
    try {
      await validateId(999, mockModel, 'TestModel');
      // If we reach here, the test should fail
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error.message).to.include('not found');
      expect(mockModel.findByPk.calledOnce).to.be.true;
      expect(mockModel.findByPk.calledWith(999)).to.be.true;
    }
  });
});

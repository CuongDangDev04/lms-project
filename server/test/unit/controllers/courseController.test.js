const { expect } = require('chai');
const sinon = require('sinon');
const { Course } = require('../../../src/models');
const courseController = require('../../../src/controllers/admin/courseController');

describe('Course Controller - Unit Tests', () => {
  // Setup sandbox for stubs
  let sandbox;
  
  beforeEach(() => {
    // Create a sandbox for each test to isolate stubs
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    // Restore all stubs after each test
    sandbox.restore();
  });
  
  describe('getCourses', () => {
    it('should return all courses', async () => {
      // Mock data
      const mockCourses = [
        { course_id: 1, course_name: 'Course 1', course_code: 'C1', description: 'Description 1' },
        { course_id: 2, course_name: 'Course 2', course_code: 'C2', description: 'Description 2' }
      ];
      
      // Create request and response objects
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub the Course.findAll method
      sandbox.stub(Course, 'findAll').resolves(mockCourses);
      
      // Call the controller method
      await courseController.getCourses(req, res);
      
      // Verify the results
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the correct data
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('success', true);
      expect(response).to.have.property('message');
      expect(response).to.have.property('data');
      expect(response.data).to.deep.equal(mockCourses);
    });
    
    it('should handle errors and return 500', async () => {
      // Create request and response objects
      const req = {};
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub the Course.findAll method to throw an error
      sandbox.stub(Course, 'findAll').throws(new Error('Database error'));
      
      // Call the controller method
      await courseController.getCourses(req, res);
      
      // Verify the results
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the error
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('error');
    });
  });
  
  describe('createCourse', () => {
    it('should create a new course with valid data', async () => {
      // Mock data
      const mockCourseData = {
        course_code: 'TEST101',
        course_name: 'Test Course',
        description: 'This is a test course'
      };
      const mockCreatedCourse = {
        course_id: 1,
        ...mockCourseData,
        course_img: 'img1'
      };
      
      // Create request and response objects
      const req = { body: mockCourseData };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub methods
      sandbox.stub(Course, 'findOne').resolves(null); // No existing course
      sandbox.stub(Course, 'create').resolves(mockCreatedCourse);
      
      // Call the controller method
      await courseController.createCourse(req, res);
      
      // Verify the results
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the correct data
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('success', true);
      expect(response).to.have.property('message');
      expect(response).to.have.property('data');
      expect(response.data).to.deep.equal(mockCreatedCourse);
    });
    
    it('should return 400 when course_name is missing', async () => {
      // Create request and response objects
      const req = {
        body: {
          course_code: 'TEST101',
          description: 'This is a test course'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Call the controller method
      await courseController.createCourse(req, res);
      
      // Verify the results
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the correct message
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('success', false);
      expect(response).to.have.property('message');
      expect(response.message).to.include('bắt buộc');
    });
    
    it('should return 400 when course already exists', async () => {
      // Mock data
      const mockCourseData = {
        course_code: 'TEST101',
        course_name: 'Test Course',
        description: 'This is a test course'
      };
      const mockExistingCourse = {
        course_id: 1,
        ...mockCourseData
      };
      
      // Create request and response objects
      const req = { body: mockCourseData };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub methods
      sandbox.stub(Course, 'findOne').resolves(mockExistingCourse);
      
      // Call the controller method
      await courseController.createCourse(req, res);
      
      // Verify the results
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the correct message
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('success', false);
      expect(response).to.have.property('message');
      expect(response.message).to.include('đã tồn tại');
    });
  });
});

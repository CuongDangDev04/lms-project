const { expect } = require('chai');
const sinon = require('sinon');
const { Submission, Grade, Assignment } = require('../../../src/models');
const submissionController = require('../../../src/controllers/users/submissionController');

describe('Submission Controller - Unit Tests', () => {
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
  
  describe('getSubmissionsByAssignment', () => {
    it('should return all submissions for a given assignment', async () => {
      // Mock data
      const mockAssignmentId = 1;
      const mockSubmissions = [
        { submission_id: 1, assignment_id: mockAssignmentId, user_id: 1, Grade: { score: 8.5, feedback: 'Good job' } },
        { submission_id: 2, assignment_id: mockAssignmentId, user_id: 2, Grade: null }
      ];
      
      // Create request and response objects
      const req = { params: { assignment_id: mockAssignmentId } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub the Submission.findAll method
      sandbox.stub(Submission, 'findAll').resolves(mockSubmissions);
      
      // Call the controller method
      await submissionController.getSubmissionsByAssignment(req, res);
      
      // Verify the results
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the correct data
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('message');
      expect(response).to.have.property('submissions');
      expect(response.submissions).to.deep.equal(mockSubmissions);
    });
    
    it('should return 404 when no submissions are found', async () => {
      // Mock data
      const mockAssignmentId = 999; // Non-existent ID
      
      // Create request and response objects
      const req = { params: { assignment_id: mockAssignmentId } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub the Submission.findAll method to return empty array
      sandbox.stub(Submission, 'findAll').resolves([]);
      
      // Call the controller method
      await submissionController.getSubmissionsByAssignment(req, res);
      
      // Verify the results
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      // Check the response contains the correct message
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('message');
      expect(response.message).to.include('Không tìm thấy bài nộp nào.');
    });
    
    it('should return 400 when assignment_id is not provided', async () => {
      // Create request and response objects
      const req = { params: {} }; // Missing assignment_id
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Call the controller method
      await submissionController.getSubmissionsByAssignment(req, res);
      
      // Verify the results
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
    
    it('should handle errors and return 500', async () => {
      // Create request and response objects
      const req = { params: { assignment_id: 1 } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub the Submission.findAll method to throw error
      sandbox.stub(Submission, 'findAll').throws(new Error('Database error'));
      
      // Call the controller method
      await submissionController.getSubmissionsByAssignment(req, res);
      
      // Verify the results
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });
  
  describe('gradeSubmission', () => {
    it('should create a new grade when none exists', async () => {
      // Mock data
      const mockSubmissionId = 1;
      const mockScore = 9.5;
      const mockFeedback = 'Excellent work!';
      const mockSubmission = {
        submission_id: mockSubmissionId,
        assignment_id: 1,
        update: sinon.stub().resolves(true)
      };
      const mockGrade = {
        submission_id: mockSubmissionId,
        assignment_id: 1,
        score: mockScore,
        feedback: mockFeedback
      };
      
      // Create request and response objects
      const req = {
        body: {
          submission_id: mockSubmissionId,
          score: mockScore,
          feedback: mockFeedback
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub methods
      sandbox.stub(Submission, 'findByPk').resolves(mockSubmission);
      sandbox.stub(Grade, 'findOne').resolves(null); // No existing grade
      sandbox.stub(Grade, 'create').resolves(mockGrade);
      
      // Call the controller method
      await submissionController.gradeSubmission(req, res);
      
      // Verify the results
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(mockSubmission.update.calledOnce).to.be.true;
      expect(mockSubmission.update.calledWith({ status: 'graded' })).to.be.true;
      
      // Check the response contains the correct data
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('message');
      expect(response).to.have.property('grade');
      expect(response.grade).to.deep.equal(mockGrade);
    });
    
    it('should update an existing grade', async () => {
      // Mock data
      const mockSubmissionId = 1;
      const mockScore = 8.0;
      const mockFeedback = 'Good work with some areas for improvement';
      const mockSubmission = {
        submission_id: mockSubmissionId,
        assignment_id: 1,
        update: sinon.stub().resolves(true)
      };
      const mockExistingGrade = {
        submission_id: mockSubmissionId,
        assignment_id: 1,
        score: 7.5,
        feedback: 'Initial feedback',
        update: sinon.stub().resolves(true)
      };
      
      // Create request and response objects
      const req = {
        body: {
          submission_id: mockSubmissionId,
          score: mockScore,
          feedback: mockFeedback
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub methods
      sandbox.stub(Submission, 'findByPk').resolves(mockSubmission);
      sandbox.stub(Grade, 'findOne').resolves(mockExistingGrade);
      
      // Call the controller method
      await submissionController.gradeSubmission(req, res);
      
      // Verify the results
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(mockExistingGrade.update.calledOnce).to.be.true;
      expect(mockExistingGrade.update.calledWith({
        score: mockScore,
        feedback: mockFeedback
      })).to.be.true;
      
      // Check the response contains the correct message
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('message');
      expect(response.message).to.include('thành công');
    });
    
    it('should return 400 when submission_id is not provided', async () => {
      // Create request and response objects
      const req = {
        body: {
          score: 9.0,
          feedback: 'Good'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Call the controller method
      await submissionController.gradeSubmission(req, res);
      
      // Verify the results
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
    
    it('should return 404 when submission is not found', async () => {
      // Create request and response objects
      const req = {
        body: {
          submission_id: 999,
          score: 9.0,
          feedback: 'Good'
        }
      };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
      };
      
      // Stub methods
      sandbox.stub(Submission, 'findByPk').resolves(null);
      
      // Call the controller method
      await submissionController.gradeSubmission(req, res);
      
      // Verify the results
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });
  });
});

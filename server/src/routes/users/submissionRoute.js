const express = require("express");
const router = express.Router();
const submissionController = require("../../controllers/users/submissionController");
const uploadSubmissions = require("../../middlewares/uploadSubmissions");

router.post("/submit",uploadSubmissions.array("files", 10), submissionController.submitAssignment);
router.get("/assignment/:assignment_id", submissionController.getSubmissionsByAssignment);
router.get("/download/:submission_id", submissionController.downloadSubmissionFiles);
router.post("/grade", submissionController.gradeSubmission);
router.delete("/delete/:submission_id", submissionController.deleteSubmission);

module.exports = router;
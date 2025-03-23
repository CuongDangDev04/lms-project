const express = require("express");
const router = express.Router();
const assignmentController = require("../../controllers/users/assignmentController");
const uploadAssignment = require("../../middlewares/uploadAssignment");

router.post("/upload", uploadAssignment.array("files", 10), assignmentController.uploadAssignment);
router.get("/classroom/:classroom_id", assignmentController.getAllAssignments);
router.get("/download/:assignment_id", assignmentController.downloadAssignmentFiles);
router.get("/user-participation/:userId/:classroomId", assignmentController.getUserParticipationId);
router.put("/:assignment_id", uploadAssignment.array("files", 10), assignmentController.updateAssignment);
router.delete("/:assignment_id", assignmentController.deleteAssignment);
module.exports = router;
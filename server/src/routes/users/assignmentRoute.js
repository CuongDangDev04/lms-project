const express = require("express");
const router = express.Router();
const assignmentController = require("../../controllers/users/assignmentController");
const uploadAssignment = require("../../middlewares/uploadAssignment");
const { verifyTokenAndRole } = require("../../middlewares/auth.middleware");

// Route để upload bài tập (chỉ giáo viên hoặc admin)
router.post(
  "/upload",
  uploadAssignment.array("files", 10),
  assignmentController.uploadAssignment
);

// Route lấy tất cả bài tập theo classroom_id (cho phép cả sinh viên và giáo viên)
router.get(
  "/classroom/:classroom_id",
  assignmentController.getAllAssignments
);

// Route tải file bài tập (hỗ trợ ?fileIndex, cho phép cả sinh viên và giáo viên)
router.get(
  "/download/:assignment_id", // Đồng nhất tên param với route khác
  assignmentController.downloadAssignmentFiles
);

// Route lấy user_participation_id (cho phép cả sinh viên và giáo viên)
router.get(
  "/user-participation/:userId/:classroomId",
  verifyTokenAndRole(1,2),
  assignmentController.getUserParticipationId
);

// Route cập nhật bài tập (chỉ giáo viên hoặc admin)
router.put(
  "/:assignment_id",
  verifyTokenAndRole(2),
  uploadAssignment.array("files", 10),
  assignmentController.updateAssignment
);

// Route xóa bài tập (chỉ giáo viên hoặc admin)
router.delete(
  "/:assignment_id",
  verifyTokenAndRole(2),
  assignmentController.deleteAssignment
);

// Route lấy danh sách bài tập chưa làm (chỉ sinh viên)
router.get(
  "/pending",
  verifyTokenAndRole(1),
  assignmentController.getPendingAssignments
);

// Route lấy chi tiết bài tập (cho phép cả sinh viên và giáo viên)
router.get(
  "/:assignment_id",
  verifyTokenAndRole(1, 2),
  assignmentController.getAssignmentDetail
);

module.exports = router;
const express = require('express');
const router = express.Router();
const classroomController = require('../../controllers/admin/classRoomController');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Tạo lớp học phần (Admin only)
router.post('/', verifyTokenAndRole(3), classroomController.createClassroom);

// Lấy danh sách tất cả lớp học phần (Admin only)
router.get('/', verifyTokenAndRole(3), classroomController.getAllClassrooms);

// Lấy thông tin lớp học phần theo ID (Admin only)
router.get('/:id', verifyTokenAndRole(3), classroomController.getClassroomById);

// Cập nhật lớp học phần (Admin only)
router.put('/:id', verifyTokenAndRole(3), classroomController.updateClassroom);

// Xóa lớp học phần (Admin only)
router.delete('/:id', verifyTokenAndRole(3), classroomController.deleteClassroom);

// Lấy danh sách sinh viên của lớp học phần (Admin only)
router.get('/:classroomId/students', classroomController.getStudentsByClassroom);

// Thêm sinh viên vào lớp học phần (Admin only)
router.post('/:classroomId/students', classroomController.addStudentToClassroom);

// Nhập danh sách sinh viên từ file Excel (Admin only)
router.post('/:classroomId/students/import', upload.single('file'), classroomController.importStudentsToClassroom);

// API bổ sung: Lấy danh sách lớp học phần (có thể dùng cho các role khác nếu cần)
router.get('/list', verifyTokenAndRole(3), classroomController.getClassrooms);

module.exports = router;
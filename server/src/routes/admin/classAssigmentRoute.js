const express = require('express');
const router = express.Router();
const classroomAssignmentController = require('../../controllers/admin/classRoomAssigmentController');

// Phân công giảng viên cho lớp học phần
router.post('/:classroom_id/assign-teacher', classroomAssignmentController.assignTeacherToClassroom);

// Cập nhật trạng thái lớp học phần
router.patch('/:classroom_id/status', classroomAssignmentController.updateClassroomStatus);

// Route để tạo lịch học cho lớp học phần
router.post('/:classroom_id/schedules', classroomAssignmentController.createScheduleForClassroom);

// Route để lấy danh sách lịch học của một lớp học phần
router.get('/:classroom_id/schedules', classroomAssignmentController.getSchedulesByClassroom);

// Route để hoãn/bù lịch học
router.put('/:classroom_id/schedules/:schedule_id/:date', classroomAssignmentController.postponeAndMakeupSchedule);
// Route để cập nhật phân công giảng viên
router.put('/:classroom_id/teacher', classroomAssignmentController.updateTeacherAssignment);

// Xem danh sách lớp học phần đã phân công cho giảng viên
router.get('/:user_id/teach', classroomAssignmentController.getClassroomsByTeacher);

// Lấy danh sách tất cả các lớp học phần đã được phân công
router.get('/assigned', classroomAssignmentController.getAllAssignedClassrooms);

module.exports = router;
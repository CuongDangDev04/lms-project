const express = require('express');
const router = express.Router();
const { 
  getCoursesByTeacher, 
  getStudentsByTeacherAndCourse 
} = require('../../controllers/users/instructorController'); // Điều chỉnh đường dẫn tới controller của bạn



// Route để lấy danh sách các khóa học mà giảng viên giảng dạy
router.get('/courses-by-teacher/:teacherId', getCoursesByTeacher);

// Route để lấy danh sách sinh viên trong một khóa học cụ thể của giảng viên
router.get('/students-by-teacher/:teacherId/:courseId', getStudentsByTeacherAndCourse);

module.exports = router;
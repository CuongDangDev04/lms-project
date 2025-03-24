const { getRequestUser } = require("../../middlewares/auth.middleware");
const CourseUserController = require("../../controllers/users/courseController");
const express = require("express");
const router = express.Router();

router.get(
  "/courseSchedule/:course_id",
  CourseUserController.fetch_specific_course_information
);
router.get("/", CourseUserController.fetch_list_courses);
router.get(
  "/studentCourse",
  getRequestUser(),
  CourseUserController.fetchStudentCourses
);
router.get(
  "/teacherInformation/:classroom_id",
  
  CourseUserController.fetchTeacherInformation
);


module.exports = router;

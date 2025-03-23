const express = require("express");
const {
  getStudentsInClassCourse,
  getClassInCourse,
  getUserClassCourse,
  createRoomOnline,
  getClassroomOfCourse,
} = require("../../controllers/users/classController");

const router = express.Router();

router.get("/:classroomId/users", getStudentsInClassCourse);
router.get("/:classroomId/class", getClassInCourse);
router.get("/user/:userId", getUserClassCourse);
router.get("/createRoom/:classroomId", createRoomOnline);
router.get("/getClassOfCourse", getClassroomOfCourse);
module.exports = router;

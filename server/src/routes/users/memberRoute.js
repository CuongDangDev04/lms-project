const express = require("express");
const router = express.Router();
const memberController = require("../../controllers/users/memberController");

router.get("/:classroomId", memberController.getAllStudentsInClassroom);

module.exports = router;

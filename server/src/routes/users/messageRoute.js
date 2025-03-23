const express = require("express");
const router = express.Router();
const messageController = require("../../controllers/users/messageController");

router.get("/:classroom_id", messageController.getAllStudentsInClassroom);

module.exports = router;

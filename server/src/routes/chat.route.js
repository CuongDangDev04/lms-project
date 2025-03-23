const express = require("express");
const {
  sendMessage,
  getMessages,
  deleteMessage,
} = require("../controllers/chatController");
const router = express.Router();

router.post("/send", sendMessage);
router.get("/:classroomId", getMessages);
router.delete("/delete/:messageId", deleteMessage);
module.exports = router;

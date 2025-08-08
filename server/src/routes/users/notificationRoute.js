const express = require("express");
const {
  getNotifications,
  deleteNotification,
  deleteAllNotification,
  markAsRead,
  markAllAsRead,
  sendNotificationAllUser,
  sendNotificationToSpecificUser,
  sendNotificationToClassroomUsers,
  sendNotificationToClassroomTeachers,
  sendTagNotification,
  getUnreadNotificationCount,
} = require("../../controllers/users/notificationController");

const router = express.Router();
router.get("/getNo", getNotifications);
router.post("/sendNo", sendNotificationAllUser);
router.post("/sendNoToClassRoom", sendNotificationToClassroomUsers);
router.post("/sendNoToUser", sendNotificationToSpecificUser);
router.post("/sendNoToTeacher", sendNotificationToClassroomTeachers);
router.post("/sendNoToUser", sendNotificationToSpecificUser);
router.post("/sendTagNotification", sendTagNotification);
router.delete("/deleteNo", deleteNotification);
router.delete("/deleteAllNo", deleteAllNotification);
router.put("/markAsRead", markAsRead);
router.put("/markAllAsRead", markAllAsRead);
router.get("/getUnreadNotificationCount", getUnreadNotificationCount);
module.exports = router;

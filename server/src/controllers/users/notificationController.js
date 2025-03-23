const {
  User,
  UserNotification,
  Notification,
  Classroom,
  UserParticipation,
  Course,
} = require("../../models");
const { getIO, onlineUsers } = require("../../config/socket");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
// Gửi thông báo cho một user_id cụ thể
const sendNotificationToSpecificUser = async (req, res) => {
  try {
    const { target_user_id, notificationType, message } = req.body;

    // Kiểm tra đầu vào
    if (!target_user_id) {
      return res.status(400).json({ error: "Target User ID là bắt buộc!" });
    }
    if (!message) {
      return res.status(400).json({ error: "Thông báo không được để trống!" });
    }
    if (!["tag", "system", "classroom"].includes(notificationType)) {
      return res.status(400).json({ error: "Loại thông báo không hợp lệ!" });
    }

    // Kiểm tra user nhận có tồn tại không
    const targetUser = await User.findOne({
      where: { user_id: target_user_id },
      attributes: ["user_id"],
    });

    if (!targetUser) {
      return res.status(404).json({ error: "Không tìm thấy người dùng nhận!" });
    }

    // Tạo notification
    const notification = await Notification.create({
      notification_type: notificationType,
      message,
    });

    // Tạo thông báo cho user cụ thể
    const userNotification = await UserNotification.create({
      user_id: target_user_id,
      notification_id: notification.notification_id,
      status: 0, // Trạng thái mặc định: chưa đọc
    });
    // Gửi thông báo qua Socket.IO nếu user đang online
    const io = getIO();
    const unreadNotificationCount = await UserNotification.count({
      where: { user_id: target_user_id, status: 0 },
    });
    const receiverSocketId = onlineUsers[target_user_id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveNotification", {
        notification_id: userNotification.notification_id,
        message,
        timestamp: new Date().toISOString(),
        status: 0,
      });

      io.to(receiverSocketId).emit("toastNotification", {
        notificationType,
        message,
      });
      io.to(receiverSocketId).emit("unreadNotificationCount", {
        unreadNotificationCount,
      });

      console.log(`📩 Đã gửi thông báo đến user ${target_user_id}`);
    } else {
      console.log(
        `⚠️ User ${target_user_id} không online, chỉ lưu vào database.`
      );
    }

    res.status(201).json({
      message: `Đã gửi thông báo đến user ${target_user_id}!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo cho user cụ thể:", error);
    res.status(500).json({ error: "Lỗi khi gửi thông báo!" });
  }
};

// Gửi thông báo cho tất cả user trong một khóa học
const sendNotificationToClassroomUsers = async (req, res) => {
  try {
    const { classroom_id, notificationType, message } = req.body;
    console.log(req.body);

    // Kiểm tra đầu vào
    if (!classroom_id) {
      return res.status(400).json({ error: "Classroom ID là bắt buộc!" });
    }
    if (!message) {
      return res.status(400).json({ error: "Thông báo không được để trống!" });
    }
    if (!["tag", "system", "classroom"].includes(notificationType)) {
      return res.status(400).json({ error: "Loại thông báo không hợp lệ!" });
    }

    // Lấy danh sách tất cả user tham gia trong classroom_id này
    const participations = await UserParticipation.findAll({
      where: { classroom_id }, // Chỉ tìm theo classroom_id cụ thể
      attributes: ["user_id"],
    });

    if (!participations || participations.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy người dùng nào trong lớp học này!" });
    }

    const userIds = [...new Set(participations.map((p) => p.user_id))]; // Loại bỏ trùng lặp

    // Lọc chỉ lấy sinh viên có role_id = 1
    const users = await User.findAll({
      where: {
        user_id: userIds,
        role_id: 1, // Chỉ lấy sinh viên có role_id = 1
      },
      attributes: ["user_id"],
    });

    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy sinh viên nào trong lớp học này!" });
    }

    // Tạo notification
    const notification = await Notification.create({
      notification_type: notificationType,
      message,
    });

    // Tạo danh sách thông báo cho tất cả user
    const notifications = users.map((user) => ({
      user_id: user.user_id,
      notification_id: notification.notification_id,
      status: 0, // Trạng thái mặc định: chưa đọc
    }));

    // Lưu tất cả thông báo vào database
    await UserNotification.bulkCreate(notifications);

    // Gửi thông báo qua Socket.IO
    const io = getIO();
    for (const user of users) {
      const unreadNotificationCount = await UserNotification.count({
        where: { user_id: user.user_id, status: 0 },
      });
      const receiverSocketId = onlineUsers[user.user_id];
      if (receiverSocketId) {
        // Gửi thông báo chi tiết
        io.to(receiverSocketId).emit("receiveNotification", {
          notification_id: notification.notification_id,
          message,
          timestamp: new Date().toISOString(),
          status: 0,
          classroom_id, // Gửi classroom_id thay vì course_id
        });

        // Gửi toast notification
        io.to(receiverSocketId).emit("toastNotification", {
          notificationType,
          message,
          classroom_id, // Gửi classroom_id thay vì course_id
        });
        io.to(receiverSocketId).emit("unreadNotificationCount", {
          unreadNotificationCount,
        });
      } else {
        console.log(
          `⚠️ Sinh viên ${user.user_id} không online, chỉ lưu vào database.`
        );
      }
    }

    res.status(201).json({
      message: `Đã gửi thông báo đến ${users.length} sinh viên trong lớp học ${classroom_id}!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo cho lớp học:", error);
    res.status(500).json({ error: "Lỗi khi gửi thông báo cho lớp học!" });
  }
};
//gửi thông báo cho tất cả người dùng
const sendNotificationAllUser = async (req, res) => {
  try {
    const { notificationType, message } = req.body;

    // Kiểm tra đầu vào

    if (!message) {
      return res.status(400).json({ error: "Thông báo không được để trống!" });
    }
    if (!["tag", "system", "classroom"].includes(notificationType)) {
      return res.status(400).json({ error: "Loại thông báo không hợp lệ!" });
    }

    // Lấy danh sách tất cả người dùng
    const users = await User.findAll({
      attributes: ["user_id"],
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng nào!" });
    }
    const notification = await Notification.create({
      notification_type: notificationType,
      message,
    });
    // Tạo danh sách thông báo cho tất cả user
    const notifications = users.map((user) => ({
      user_id: user.user_id,
      notification_id: notification.notification_id,
      status: 0, // Trạng thái mặc định
    }));

    // Lưu tất cả thông báo vào database bằng bulkCreate
    const createdNotifications = await UserNotification.bulkCreate(
      notifications
    );

    // Gửi thông báo qua Socket.IO cho tất cả client
    const io = getIO();
    for (const user of users) {
      // 🆕 Lấy từng user object
      const unreadNotificationCount = await UserNotification.count({
        where: { user_id: user.user_id, status: 0 },
      });
      const receiverSocketId = onlineUsers[user.user_id]; // 🆕 Truy cập đúng user_id
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveNotification", {
          notification_id: notification.notification_id,
          message,
          timestamp: new Date().toISOString(),
          status: 0,
        });
        console.log(`📩 Đã gửi thông báo đến user ${user.user_id}`);
        io.to(receiverSocketId).emit("toastNotification", {
          notificationType,
          message,
        });
        io.to(receiverSocketId).emit("unreadNotificationCount", {
          unreadNotificationCount,
        });
        console.log(
          `📢 Đã gửi toastNotification: ${message} đến user ${user.user_id}`
        );
      } else {
        console.log(
          `⚠️ User ${user.user_id} không online, chỉ lưu vào database.`
        );
      }
    }

    res.status(201).json({
      message: `Đã gửi thông báo đến ${users.length} người dùng!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo:", error);
    res.status(500).json({ error: "Lỗi khi gửi thông báo!" });
  }
};

const sendNotificationToClassroomTeachers = async (req, res) => {
  try {
    const { classroom_id, notificationType, message } = req.body;
    console.log(req.body);

    // Kiểm tra đầu vào
    if (!classroom_id) {
      return res.status(400).json({ error: "Classroom ID là bắt buộc!" });
    }
    if (!message) {
      return res.status(400).json({ error: "Thông báo không được để trống!" });
    }
    if (!["tag", "system", "classroom"].includes(notificationType)) {
      return res.status(400).json({ error: "Loại thông báo không hợp lệ!" });
    }

    // Lấy danh sách tất cả user tham gia trong classroom_id này
    const participations = await UserParticipation.findAll({
      where: { classroom_id }, // Chỉ tìm theo classroom_id cụ thể
      attributes: ["user_id"],
    });

    if (!participations || participations.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy người dùng nào trong lớp học này!" });
    }

    const userIds = [...new Set(participations.map((p) => p.user_id))]; // Loại bỏ trùng lặp

    // Lọc chỉ lấy giảng viên có role_id = 2 (giả sử role_id của giảng viên là 2)
    const teachers = await User.findAll({
      where: {
        user_id: userIds,
        role_id: 2, // Chỉ lấy giảng viên có role_id = 2
      },
      attributes: ["user_id"],
    });

    if (!teachers || teachers.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy giảng viên nào trong lớp học này!" });
    }

    // Tạo notification
    const notification = await Notification.create({
      notification_type: notificationType,
      message,
    });

    // Tạo danh sách thông báo cho tất cả giảng viên
    const notifications = teachers.map((teacher) => ({
      user_id: teacher.user_id,
      notification_id: notification.notification_id,
      status: 0, // Trạng thái mặc định: chưa đọc
    }));

    // Lưu tất cả thông báo vào database
    await UserNotification.bulkCreate(notifications);

    // Gửi thông báo qua Socket.IO
    const io = getIO();
    for (const teacher of teachers) {
      const unreadNotificationCount = await UserNotification.count({
        where: { user_id: teacher.user_id, status: 0 },
      });
      const receiverSocketId = onlineUsers[teacher.user_id];
      if (receiverSocketId) {
        // Gửi thông báo chi tiết
        io.to(receiverSocketId).emit("receiveNotification", {
          notification_id: notification.notification_id,
          message,
          timestamp: new Date().toISOString(),
          status: 0,
          classroom_id,
        });

        // Gửi toast notification
        io.to(receiverSocketId).emit("toastNotification", {
          notification_id: notification.notification_id,
          notificationType,
          message,
          classroom_id,
        });
        io.to(receiverSocketId).emit("unreadNotificationCount", {
          unreadNotificationCount,
        });
        console.log(
          `📩 Đã gửi thông báo đến giảng viên ${teacher.user_id} trong lớp học ${classroom_id}`
        );
      } else {
        console.log(
          `⚠️ Giảng viên ${teacher.user_id} không online, chỉ lưu vào database.`
        );
      }
    }

    res.status(201).json({
      message: `Đã gửi thông báo đến ${teachers.length} giảng viên trong lớp học ${classroom_id}!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo cho giảng viên:", error);
    res.status(500).json({ error: "Lỗi khi gửi thông báo cho giảng viên!" });
  }
};

//cmt phần nhận thông báo bằng header request
const getNotifications = async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(404).json({ error: "Thiếu thông tin người dùng!" });
    }

    const userNotifications = await UserNotification.findAll({
      where: { user_id: userId },
      include: {
        model: Notification,
        attributes: [
          "notification_id",
          "notification_type",
          "message",
          "timestamp",
        ],
      },
    });

    res.status(200).json(userNotifications);
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    res.status(500).json({ error: "Lỗi khi lấy thông báo!" });
  }
};
const deleteNotification = async (req, res) => {
  try {
    const { notificationId, userId } = req.query;

    if (!notificationId) {
      return res.status(400).json({ error: "Thiếu thông tin thông báo!" });
    }

    const notification = await UserNotification.destroy({
      where: { notification_id: notificationId, user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Không tìm thấy thông báo!" });
    }
    const io = getIO();
    const receiverSocketId = onlineUsers[userId];
    io.to(receiverSocketId).emit("notificationDeleted", notificationId);
    const unreadNotificationCount = await UserNotification.count({
      where: { user_id: userId, status: 0 },
    });
    io.to(receiverSocketId).emit("unreadNotificationCount", {
      unreadNotificationCount: unreadNotificationCount,
    });
    res.status(200).json({ message: "Đã xóa thông báo!" });
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    res.status(500).json({ error: "Lỗi khi xóa thông báo!" });
  }
};
const deleteAllNotification = async (req, res) => {
  try {
    const { userId } = req.query;

    const notification = await UserNotification.destroy({
      where: { user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({ error: "Không tìm thấy thông báo!" });
    }
    const io = getIO();
    const receiverSocketId = onlineUsers[userId];
    io.to(receiverSocketId).emit("AllNotificationDeleted", userId);
    io.to(receiverSocketId).emit("unreadNotificationCount", {
      unreadNotificationCount: 0,
    });

    res.status(200).json({ message: "Đã xóa thông báo!" });
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    res.status(500).json({ error: "Lỗi khi xóa thông báo!" });
  }
};
const markAsRead = async (req, res) => {
  try {
    const { notificationId, userId } = req.body;

    const updated = await UserNotification.update(
      { status: 1 },
      { where: { notification_id: notificationId, user_id: userId } }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: "Thông báo không tồn tại!" });
    }
    const io = getIO();
    const receiverSocketId = onlineUsers[userId];
    io.to(receiverSocketId).emit("notificationRead", notificationId);
    const unreadNotificationCount = await UserNotification.count({
      where: { user_id: userId, status: 0 },
    });
    io.to(receiverSocketId).emit("unreadNotificationCount", {
      unreadNotificationCount: unreadNotificationCount,
    });
    res.status(200).json({ message: "Đã đọc thông báo!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái thông báo:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái thông báo!" });
  }
};
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    const updated = await UserNotification.update(
      { status: 1 },
      { where: { user_id: userId, status: 0 } }
    );
    const io = getIO();
    const receiverSocketId = onlineUsers[userId];

    io.to(receiverSocketId).emit("allNotificationsRead", userId);
    io.to(receiverSocketId).emit("unreadNotificationCount", {
      unreadNotificationCount: 0,
    });

    res
      .status(200)
      .json({ message: "Tất cả thông báo đã được đánh dấu là đã đọc!" });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái tất cả thông báo:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi cập nhật trạng thái tất cả thông báo!" });
  }
};
const sendTagNotification = async (req, res) => {
  try {
    const { classroomId, taggedUserIds } = req.body;
    const message = "Bạn đang được tag trong lớp ";
    // Kiểm tra đầu vào
    if (
      !taggedUserIds ||
      !Array.isArray(taggedUserIds) ||
      taggedUserIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Danh sách người dùng được tag là bắt buộc!" });
    }
    if (!message) {
      return res.status(400).json({ error: "Thông báo không được để trống!" });
    }

    // Kiểm tra và lọc ra user hợp lệ
    const targetUsers = await User.findAll({
      where: { user_id: { [Op.in]: taggedUserIds } },
      attributes: ["user_id"],
    });

    if (targetUsers.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy người dùng hợp lệ!" });
    }
    const classroom = await Classroom.findOne({
      where: { classroom_id: classroomId },
      attributes: ["classroom_id"],
      include: [
        {
          model: Course,
          attributes: ["course_name"],
        },
      ],
    });
    // Tạo notification
    const notification = await Notification.create({
      notification_type: "tag",
      message: message + classroom.Course.course_name,
    });

    // Gửi thông báo cho từng user trong danh sách
    const io = getIO();
    for (const user of targetUsers) {
      const { user_id } = user;

      // Lưu vào database
      await UserNotification.create({
        user_id,
        notification_id: notification.notification_id,
        status: 0, // Trạng thái mặc định: chưa đọc
      });

      // Gửi thông báo qua Socket.IO nếu user online
      const receiverSocketId = onlineUsers[user_id];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveNotification", {
          notification_id: notification.notification_id,
          notification_type: notification.notification_type,
          message,
          timestamp: new Date().toISOString(),
          status: 0,
        });

        io.to(receiverSocketId).emit("toastNotification", {
          notificationId: notification.notification_id,
          notificationType: "tag",
          message,
        });

        console.log(`📩 Đã gửi thông báo tag đến user ${user_id}`);
      } else {
        console.log(`⚠️ User ${user_id} không online, chỉ lưu vào database.`);
      }
    }

    res.status(201).json({
      message: `Đã gửi thông báo tag đến ${targetUsers.length} người dùng!`,
    });
  } catch (error) {
    console.error("Lỗi khi gửi thông báo tag:", error);
    res.status(500).json({ error: "Lỗi khi gửi thông báo!" });
  }
};
const getUnreadNotificationCount = async (req, res) => {
  try {
    const { userId } = req.query;

    const unreadNotificationCount = await UserNotification.count({
      where: { user_id: userId, status: 0 },
    });

    res.status(200).json({ unreadNotificationCount });
  } catch (error) {
    console.error("Lỗi khi lấy số lượng thông báo chưa đọc:", error);
    res.status(500).json({ error: "Lỗi khi lấy số lượng thông báo chưa đọc!" });
  }
};
module.exports = {
  sendNotificationAllUser,
  getNotifications,
  deleteNotification,
  deleteAllNotification,
  markAsRead,
  markAllAsRead,
  sendNotificationToClassroomUsers,
  sendNotificationToSpecificUser,
  sendNotificationToClassroomTeachers,
  sendTagNotification,
  getUnreadNotificationCount,
};

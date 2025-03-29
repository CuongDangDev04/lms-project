const {
  ChatMessage,
  User,
  UserParticipation,
  sequelize,
  Classroom,
  Class,
  Course,
  Notification,
  UserNotification,
} = require("../models");
const { getIO, onlineUsers } = require("../config/socket");
const { QueryTypes } = require("sequelize");
// const sendMessage = async (req, res) => {
//   try {
//     const { classId, courseId, userId, message } = req.body;

//     if (!message)
//       return res.status(400).json({ error: "Tin nhắn không được để trống!" });

//     const userMessage = await ChatMessage.create({
//       class_id: classId,
//       course_id: courseId,
//       user_id: userId,
//       message,
//     });

//     res.status(201).json({ message: "Tin nhắn đã được gửi!" });
//   } catch (error) {
//     console.error("Lỗi khi lưu tin nhắn:", error);
//     res.status(500).json({ error: "Lỗi khi lưu tin nhắn!" });
//   }
// };
const sendMessage = async (req, res) => {
  try {
    const { userId, classroomId, message, reply } = req.body;

    if (!classroomId) {
      return res.status(400).json({ error: "Thiếu thông tin lớp học!" });
    }
    if (!message) {
      return res.status(400).json({ error: "Tin nhắn không được để trống!" });
    }
    if (!reply) {
      console.log("ĐÉO NHÂN ĐƯỢC REPLY");
    }
    var replyMessage = {};
    var reply_taggedUsers = [];
    if (reply) {
      replyMessage = await ChatMessage.findOne({
        where: { message_id: reply },
        attributes: [
          "message_id",
          "participate_id",
          "message",
          "tagged_user_ids",
          "timestamp",
          "status",
        ],
        include: [
          {
            model: UserParticipation,
            attributes: ["user_id"],
            include: {
              model: User,
              attributes: ["username", "fullname"],
              require: true,
            },
          },
        ],
      });
      let reply_tagged_user_ids = replyMessage.tagged_user_ids;
      if (reply_tagged_user_ids.length > 0) {
        reply_taggedUsers = await User.findAll({
          where: { user_id: reply_tagged_user_ids },
          attributes: ["user_id", "username"],
        });
      }
    }
    // console.log("asdadaasda: ", replyMessage.message_id);
    // return res.status(200).json(replyMessage);

    const usersInClass = await User.findAll({
      attributes: ["user_id", "username"],
      include: {
        model: UserParticipation,
        where: { classroom_id: classroomId },
      },
    });
    let cleanMessage = message;
    const taggedUserIds = [];
    usersInClass.forEach((user) => {
      const tagPattern = new RegExp(`@${user.username}\\b`, "g");
      if (message.match(tagPattern)) {
        taggedUserIds.push(user.user_id);
        cleanMessage = cleanMessage.replace(tagPattern, "").trim();
      }
    });

    // Lấy thông tin user từ database
    const isParticipate = await UserParticipation.findOne({
      where: { user_id: userId, classroom_id: classroomId },
      attributes: ["participate_id"],
      include: {
        model: User,
        attributes: ["user_id", "username", "fullname"],
      },
    });

    if (!isParticipate) {
      return res.status(404).json({ error: "Người dùng không tồn tại!" });
    }

    // Lưu tin nhắn vào database
    const userMessage = await ChatMessage.create({
      participate_id: isParticipate.participate_id,
      message: cleanMessage,
      tagged_user_ids: taggedUserIds,
      reply,
    });

    let taggedUsers = [];
    if (taggedUserIds.length > 0) {
      taggedUsers = await User.findAll({
        where: { user_id: taggedUserIds },
        attributes: ["user_id", "username"],
      });
    }
    const classroom = await Classroom.findOne({
      where: { classroom_id: classroomId },
      include: [
        {
          model: Class,
          attributes: ["class_name"],
        },
        {
          model: Course,
          attributes: ["course_name"],
        },
      ],
    });
    const notification = await Notification.create({
      message:
        "Lớp " +
        classroom.Course.course_name +
        " - " +
        classroom.Class.class_name +
        " của bạn có tin nhắn mới!",
      notification_type: "classroom",
    });
    const io = getIO();
    // Gửi tin nhắn + username về client thông qua socket.io
    getIO()
      .to(classroomId)
      .emit("receiveMessage", {
        message_id: userMessage.message_id,
        message: userMessage.message,
        userId: isParticipate.User.user_id,
        username: isParticipate.User.username, // Thêm username vào tin nhắn
        fullname: isParticipate.User.fullname,
        taggedUsers,
        timestamp: userMessage.timestamp,
        classroomId,
        reply_user_id: replyMessage?.user_participation?.User?.user_id || null,
        reply_message_id: replyMessage?.message_id || null,
        reply_message: replyMessage?.message || null,
        reply_username:
          replyMessage?.user_participation?.User?.username || null,
        reply_fullname:
          replyMessage?.user_participation?.User?.fullname || null,
        reply_taggedUsers,
        reply_status: replyMessage?.status || 1,
      });

    for (const user of taggedUsers) {
      io.emit("tagNotification", {
        messageId: userMessage.message_id,
        sender: userId,
        sendTo: user.user_id,

        classroomId,
      });
    }

    // console.log("hehehe", classroom);
    for (const user of usersInClass) {
      await UserNotification.create({
        user_id: user.user_id,
        notification_id: notification.notification_id,
        status: 0, // Trạng thái mặc định: chưa đọc
      });
      const receiveUserId = onlineUsers[user.user_id];

      io.to(receiveUserId).emit("receiveMessageNotification", {
        message: userMessage.message_id,
        sender: userId,
        sendTo: user.user_id,
        classroomId,
        className: classroom.Class.class_name,
        courseName: classroom.Course.course_name,
      });
      io.to(receiveUserId).emit("receiveNotification", {
        notification_id: notification.notification_id,
        notification_type: notification.notification_type,
        message: notification.message,
        timestamp: new Date().toISOString(),
        status: 0,
        classroomId,
      });
    }

    res.status(201).json({ message: "Tin nhắn đã được gửi!" });
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn:", error);
    res.status(500).json({ error: "Lỗi khi lưu tin nhắn!" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      return res
        .status(400)
        .json({ error: "Thiếu classroomId trong request!" });
    }

    const messages = await sequelize.query(
      `SELECT cm.message_id, up.user_id, cm.message,cm.timestamp,cm.tagged_user_ids, up.classroom_id, u.username , u.fullname, CAST(cm.status AS UNSIGNED) AS status , reply_msg.message_id AS reply_message_id,reply_msg.tagged_user_ids AS reply_tagged_user_ids,
    reply_msg.message AS reply_message,
    reply_user.user_id AS reply_user_id,
    reply_user.username AS reply_username,
    reply_user.fullname AS reply_fullname
       FROM chat_messages cm
       JOIN user_participations up ON up.participate_id = cm.participate_id
       JOIN users u ON u.user_id = up.user_id
       LEFT JOIN chat_messages reply_msg ON reply_msg.message_id = cm.reply
       LEFT JOIN user_participations reply_up ON reply_up.participate_id = reply_msg.participate_id
       LEFT JOIN users reply_user ON reply_user.user_id = reply_up.user_id
       WHERE up.classroom_id = :classroomId`,
      {
        type: QueryTypes.SELECT,
        replacements: { classroomId: classroomId }, // Thay thế giá trị động
      }
    );

    for (let msg of messages) {
      if (msg.tagged_user_ids) {
        const taggedUserIds = msg.tagged_user_ids;
        if (taggedUserIds.length > 0) {
          const taggedUsers = await User.findAll({
            where: { user_id: taggedUserIds },
            attributes: ["user_id", "username"],
          });
          msg.taggedUsers = taggedUsers;
        } else {
          msg.taggedUsers = [];
        }
      } else {
        msg.taggedUsers = [];
      }
      if (msg.reply_tagged_user_ids) {
        const taggedUserIds = msg.reply_tagged_user_ids;
        if (taggedUserIds.length > 0) {
          const taggedUsers = await User.findAll({
            where: { user_id: taggedUserIds },
            attributes: ["user_id", "username"],
          });
          msg.reply_taggedUsers = taggedUsers;
        } else {
          msg.reply_taggedUsers = [];
        }
      } else {
        msg.reply_taggedUsers = [];
      }
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn!" });
  }
};
const deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await ChatMessage.findByPk(messageId);
    if (!message) {
      console.error("Không tìm thấy tin nhắn!");
      return;
    }

    await message.update({
      status: 0,
    });

    // Phát sự kiện socket để tất cả client cập nhật UI
    getIO().emit("messageDeleted", messageId);

    res.json({ success: true, messageId });
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = { sendMessage, getMessages, deleteMessage };

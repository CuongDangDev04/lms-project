const { Server } = require("socket.io");
const dotenv = require("dotenv");

dotenv.config();
let io;
const API_FE = [process.env.API_FRONTEND_DEV, process.env.API_FRONTEND_PROD];
let onlineUsers = {};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: API_FE,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);
    socket.on("registerUser", (userId) => {
      onlineUsers[userId] = socket.id;
      console.log(`🔗 User ${userId} kết nối với socket ${socket.id}`);
    });

    socket.on("sendMessage", (data) => {
      // console.log("Tin nhắn nhận được từ client:", data);
      io.emit("receiveMessage", data); // Gửi lại tin nhắn cho tất cả client
    });
    socket.on("deleteMessage", (messageId) => {
      // console.log(`Tin nhắn ${messageId} đã bị xóa`);
      io.emit("messageDeleted", messageId); // Thông báo cho tất cả client
    });
    socket.on("sendNotification", ({ userId, message }) => {
      const receiverSocketId = onlineUsers[userId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveNotification", {
          message,
          timestamp: new Date().toISOString(),
        });
        console.log(`📩 Gửi thông báo tới user ${userId}`);
      } else {
        console.log(`⚠️ User ${userId} không online!`);
      }
    });

    socket.on("deleteNotification", (notificationId) => {
      // console.log(`Tin nhắn ${messageId} đã bị xóa`);
      io.emit("notificationDeleted", notificationId); // Thông báo cho tất cả client
    });
    socket.on("disconnect", () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          console.log(`❌ User ${userId} đã ngắt kết nối`);
        }
      }
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};

module.exports = { initSocket, getIO, onlineUsers };

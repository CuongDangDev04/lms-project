const express = require("express");
require("dotenv").config();
const cors = require("cors");
const sequelize = require("./config/db");
const classRoutes = require("./routes/users/classRoute");
const userRoute = require("./routes/users/indexRoute");
const authRoute = require("./routes/auth/authRoute");
const adminRoute = require("./routes/admin/indexRoute");
const chatRoutes = require("./routes/chat.route");
const NotificationRoute = require("./routes/users/notificationRoute");
const http = require("http");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

const PROD = process.env.API_FRONTEND_PROD;
const DEV = process.env.API_FRONTEND_DEV;
// Cấu hình middleware
app.use("/assets", express.static("assets"));
app.use(express.json());
app.use(
  cors({
    exposedHeaders: ["Content-Disposition"],
    origin: PROD || DEV,
    credentials: true,
  })
);

// Định nghĩa các route
app.use("/api/class-course", classRoutes);
app.use("/api/notification", NotificationRoute);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api", userRoute);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;

// Import tất cả các model
require("./models/index");

// Khởi tạo Socket.IO
initSocket(server);

// Kiểm tra kết nối cơ sở dữ liệu và chạy server
(async () => {
  try {
    // Chỉ kiểm tra kết nối, không đồng bộ bảng
    await sequelize.authenticate();
    console.log("Connected to the database successfully");

    // Khởi động server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
})();
const express = require("express");
require('dotenv').config();
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
app.use('/assets', express.static('assets'));
app.use(express.json());
app.use(cors({
  exposedHeaders: ["Content-Disposition"], 
}));
app.use("/api/class-course", classRoutes);
app.use("/api/notification", NotificationRoute);
const PORT = process.env.PORT || 5000;
//Route
//folder auth
app.use("/api/auth", authRoute);
//folder admin
app.use("/api/admin", adminRoute);
//folder users
app.use("/api", userRoute);
//chat
app.use("/api/chat", chatRoutes);

require("./models/index");
initSocket(server);
sequelize
  .sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("Error connecting to the database:", err));

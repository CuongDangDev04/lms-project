const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục uploads/assignment nếu chưa tồn tại
const uploadDir = path.join(__dirname, "uploads/assignment");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer để lưu file vào thư mục uploads/assignment
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/assignment"); // Thư mục lưu file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Đặt tên file duy nhất
  },
});

const uploadAssignment = multer({ storage: storage });

module.exports = uploadAssignment;
const multer = require("multer");

// Cấu hình multer để lưu file tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file tạm thời
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Đặt tên file duy nhất
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
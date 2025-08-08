const multer = require('multer');

/**
 * Cấu hình multer để xử lý file upload vào memory thay vì disk
 * Phù hợp với việc upload file trực tiếp lên Supabase
 */
const uploadv2 = multer({
  storage: multer.memoryStorage(), // Lưu file trong memory dưới dạng buffer
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // Giới hạn kích thước file: 2GB
  fileFilter: (req, file, cb) => {
    // (Tùy chọn) Lọc loại file nếu cần
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Chỉ hỗ trợ file JPG, PNG, PDF, hoặc MP4!'));
    }
    cb(null, true);
  },
});

module.exports = uploadv2;
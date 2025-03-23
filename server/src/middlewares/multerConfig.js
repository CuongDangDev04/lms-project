const multer = require('multer');
const path = require('path');
const fs = require('fs');

const lectureDir = path.join(__dirname, '../../uploads/lectures');
if (!fs.existsSync(lectureDir)) {
  fs.mkdirSync(lectureDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, lectureDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const uploadv2 = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB (2 * 1024 * 1024 * 1024 bytes)
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'video/mp4',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận JPEG, PNG, PDF, MP4, Excel (XLS/XLSX), hoặc PowerPoint (PPT/PPTX)!'), false);
    }
  },
});

module.exports = uploadv2;
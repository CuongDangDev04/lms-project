const { Submission, Grade, Assignment } = require("../../models/index");
const fs = require("fs"); // Để dùng createReadStream
const fsPromises = require("fs").promises; // Để dùng access bất đồng bộ
const path = require("path");
const archiver = require("archiver");
// Hàm nộp bài tập
exports.submitAssignment = async (req, res) => {
  try {
    const { assignment_id, user_id } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!assignment_id || !user_id) {
      return res.status(400).json({
        message: "Vui lòng cung cấp assignment_id và user_id.",
      });
    }

    // Kiểm tra bài tập có tồn tại và còn trong thời hạn không
    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy bài tập." });
    }
    if (assignment.end_assignment && new Date() > new Date(assignment.end_assignment)) {
      return res.status(400).json({ message: "Đã hết hạn nộp bài." });
    }

    // Kiểm tra xem có file được upload không
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Vui lòng upload ít nhất một file để nộp bài.",
      });
    }

    // Lấy danh sách đường dẫn file
    const file_paths = req.files.map((file) => file.path);

    // Tạo bản ghi bài nộp
    const newSubmission = await Submission.create({
      assignment_id,
      user_id,
      file_path: JSON.stringify(file_paths),
      submitted_at: new Date(),
      status: "pending",
    });

    res.status(201).json({
      message: "Nộp bài tập thành công!",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Lỗi khi nộp bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi nộp bài tập." });
  }
};

// Hàm lấy danh sách bài nộp theo assignment_id
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    if (!assignment_id) {
      return res.status(400).json({ message: "Vui lòng cung cấp assignment_id." });
    }

    const submissions = await Submission.findAll({
      where: { assignment_id },
      include: [
        {
          model: Grade,
          attributes: ["score", "feedback"],
          required: false,
        },
      ],
    });

    if (!submissions.length) {
      return res.status(404).json({ message: "Không tìm thấy bài nộp nào." });
    }

    res.status(200).json({
      message: "Lấy danh sách bài nộp thành công!",
      submissions,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách bài nộp." });
  }
};

// Hàm tải file bài nộp
exports.downloadSubmissionFiles = async (req, res) => {
  try {
    const { submission_id } = req.params;
    const { fileIndex } = req.query;

    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài nộp." });
    }

    const filePaths = JSON.parse(submission.file_path || "[]");
    if (filePaths.length === 0) {
      return res.status(400).json({ message: "Không có file nào để tải." });
    }

    console.log(`Số lượng file trong filePaths: ${filePaths.length}`); // Log để kiểm tra

    if (fileIndex !== undefined) {
      const index = parseInt(fileIndex, 10);
      if (isNaN(index) || index < 0 || index >= filePaths.length) {
        return res.status(400).json({ message: "Chỉ số file không hợp lệ." });
      }
      const filePath = filePaths[index];
      const absolutePath = path.resolve(filePath);
      await fsPromises.access(absolutePath);

      const originalFileName = path.basename(filePath);
      console.log(`Tải file đơn lẻ (fileIndex): ${originalFileName}`);
      res.setHeader("Content-Disposition", `attachment; filename="${originalFileName}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      return fs.createReadStream(absolutePath).pipe(res);
    }

    if (filePaths.length === 1) {
      const filePath = filePaths[0];
      const absolutePath = path.resolve(filePath);
      await fsPromises.access(absolutePath);

      const originalFileName = path.basename(filePath);
      console.log(`Tải file đơn lẻ (một file): ${originalFileName}`);
      res.setHeader("Content-Disposition", `attachment; filename="${originalFileName}"`);
      res.setHeader("Content-Type", "application/octet-stream");
      return fs.createReadStream(absolutePath).pipe(res);
    }

    if (filePaths.length > 1) {
      res.setHeader("Content-Disposition", `attachment; filename="submission_${submission_id}.zip"`);
      res.setHeader("Content-Type", "application/zip");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      for (const filePath of filePaths) {
        const absolutePath = path.resolve(filePath);
        await fsPromises.access(absolutePath);
        const originalFileName = path.basename(filePath);
        archive.file(absolutePath, { name: originalFileName });
      }

      await archive.finalize();
      return;
    }
  } catch (error) {
    console.error("Lỗi khi tải file bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi tải file bài nộp." });
  }
};

// Hàm chấm điểm bài nộp
exports.gradeSubmission = async (req, res) => {
  try {
    const { submission_id, score, feedback } = req.body;

    if (!submission_id || score === undefined) {
      return res.status(400).json({
        message: "Vui lòng cung cấp submission_id và score.",
      });
    }

    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài nộp." });
    }

    let grade = await Grade.findOne({ where: { submission_id } });
    if (grade) {
      await grade.update({
        score,
        feedback: feedback || grade.feedback,
      });
    } else {
      grade = await Grade.create({
        submission_id,
        assignment_id: submission.assignment_id,
        score,
        feedback,
      });
    }

    await submission.update({ status: "graded" });

    res.status(200).json({
      message: "Chấm điểm bài nộp thành công!",
      grade,
    });
  } catch (error) {
    console.error("Lỗi khi chấm điểm bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi chấm điểm bài nộp." });
  }
};

// Hàm xóa bài nộp
exports.deleteSubmission = async (req, res) => {
  try {
    const { submission_id } = req.params;

    if (!submission_id) {
      return res.status(400).json({ message: "Vui lòng cung cấp submission_id." });
    }

    const submission = await Submission.findByPk(submission_id);
    if (!submission) {
      return res.status(404).json({ message: "Không tìm thấy bài nộp." });
    }

    const filePaths = JSON.parse(submission.file_path || "[]");
    for (const filePath of filePaths) {
      try {
        const absolutePath = path.resolve(filePath);
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
      } catch (err) {
        console.error(`Không thể xóa file ${filePath}:`, err.message);
      }
    }

    await submission.destroy();

    res.status(200).json({ message: "Xóa bài nộp thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa bài nộp." });
  }
};
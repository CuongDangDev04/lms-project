const { Submission, Grade, Assignment } = require("../../models/index");
const supabase = require("../../config/supabase"); // Client Supabase

// Hàm hỗ trợ để parse file_path an toàn
const parseFilePath = (filePath) => {
  try {
    if (!filePath || typeof filePath !== "string") return [];
    if (filePath.startsWith("[") && filePath.endsWith("]")) return JSON.parse(filePath);
    return [filePath];
  } catch (error) {
    console.error("Lỗi khi parse file_path:", error.message, "filePath:", filePath);
    return typeof filePath === "string" ? [filePath] : [];
  }
};

// Hàm hỗ trợ tải file lên Supabase
const uploadFilesToSupabase = async (files) => {
  const uploadedFiles = [];
  for (const file of files) {
    const fileName = `submission/${Date.now()}-${file.originalname}`; // Lưu vào thư mục submission
    const { data, error } = await supabase.storage
      .from('lms-bucket')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });
    if (error) throw error;
    uploadedFiles.push({ path: fileName });
  }
  return uploadedFiles;
};

// Hàm hỗ trợ lấy URL có chữ ký từ Supabase
const getSignedUrlFromSupabase = async (bucketName, filePath, expiry = 60) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiry);

  if (error) {
    console.error(`Lỗi khi lấy URL có chữ ký từ Supabase: ${error.message}`);
    return null;
  }
  return data.signedUrl;
};

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

    // Upload file từ buffer lên Supabase
    const uploadedFiles = await uploadFilesToSupabase(req.files);

    // Tạo bản ghi bài nộp
    const newSubmission = await Submission.create({
      assignment_id,
      user_id,
      file_path: JSON.stringify(uploadedFiles.map(f => f.path)), // Lưu đường dẫn file trên Supabase
      submitted_at: new Date(),
      status: "pending",
    });

    res.status(201).json({
      message: "Nộp bài tập thành công!",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Lỗi khi nộp bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi nộp bài tập.", error: error.message });
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

    // Thêm signed URL cho từng file trong submissions
    const submissionsWithUrls = await Promise.all(
      submissions.map(async (submission) => {
        const filePaths = parseFilePath(submission.file_path);
        const signedUrls = await Promise.all(
          filePaths.map(async (filePath) => {
            const signedUrl = await getSignedUrlFromSupabase("lms-bucket", filePath);
            return { filePath, signedUrl };
          })
        );
        return {
          ...submission.toJSON(),
          file_urls: signedUrls,
        };
      })
    );

    res.status(200).json({
      message: "Lấy danh sách bài nộp thành công!",
      submissions: submissionsWithUrls,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách bài nộp.", error: error.message });
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

    const filePaths = parseFilePath(submission.file_path);
    if (filePaths.length === 0) {
      return res.status(400).json({ message: "Không có file nào để tải." });
    }

    if (fileIndex === undefined) {
      return res.status(400).json({ message: "Vui lòng cung cấp fileIndex để tải file." });
    }

    const index = parseInt(fileIndex, 10);
    if (isNaN(index) || index < 0 || index >= filePaths.length) {
      return res.status(400).json({ message: "Chỉ số file không hợp lệ." });
    }

    const filePath = filePaths[index];
    const signedUrl = await getSignedUrlFromSupabase("lms-bucket", filePath);
    if (!signedUrl) {
      return res.status(500).json({ message: "Không thể tạo URL tải file." });
    }

    return res.status(200).json({
      message: "Lấy URL tải file thành công!",
      fileUrl: signedUrl,
      filename: filePath.split('/').pop(), // Lấy tên file từ đường dẫn
    });
  } catch (error) {
    console.error("Lỗi khi tải file bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi tải file bài nộp.", error: error.message });
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
    res.status(500).json({ message: "Có lỗi xảy ra khi chấm điểm bài nộp.", error: error.message });
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

    // Xóa file trên Supabase
    const filePaths = parseFilePath(submission.file_path);
    if (filePaths.length > 0) {
      const { error } = await supabase.storage.from("lms-bucket").remove(filePaths);
      if (error) {
        console.error(`Lỗi khi xóa file trên Supabase: ${error.message}`);
        return res.status(500).json({ message: "Lỗi khi xóa file trên Supabase.", error: error.message });
      }
    }

    // Xóa bản ghi bài nộp
    await submission.destroy();

    res.status(200).json({ message: "Xóa bài nộp thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa bài nộp:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa bài nộp.", error: error.message });
  }
};
const {
  Assignment,
  UserParticipation,
  Class,
  Classroom,
  Course,
  Notification,
  UserNotification,
  Submission,
} = require("../../models/index");
const supabase = require("../../config/supabase"); // Client Supabase
const { Op } = require("sequelize");
const fs = require('fs').promises;
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
    const fileName = `assignment/${Date.now()}-${file.originalname}`; // Tạo tên file duy nhất
    const { data, error } = await supabase.storage
      .from('lms-bucket')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype, // Đảm bảo loại file đúng
      });
    if (error) throw error;
    uploadedFiles.push({ path: fileName }); // Lưu đường dẫn file trên Supabase
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

// Hàm upload bài tập
const uploadAssignment = async (req, res) => {
  try {
    const { user_participation_id, title, description, start_assignment, end_assignment, user_id } = req.body;

    if (!user_participation_id || !title || !user_id) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ user_participation_id, title và user_id.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Vui lòng upload ít nhất một file." });
    }

    // Upload file từ buffer lên Supabase
    const uploadedFiles = await uploadFilesToSupabase(req.files);

    const newAssignment = await Assignment.create({
      user_participation_id,
      title,
      description,
      start_assignment: start_assignment ? new Date(start_assignment) : null,
      end_assignment: end_assignment ? new Date(end_assignment) : null,
      user_id,
      file_path: JSON.stringify(uploadedFiles.map(f => f.path)),
    });

    res.status(201).json({
      message: "Upload bài tập thành công!",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Lỗi khi upload bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi upload bài tập.", error: error.message });
  }
};

// Hàm tải file bài tập
const downloadAssignmentFiles = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { fileIndex } = req.query;

    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy bài tập." });
    }

    let filePaths = parseFilePath(assignment.file_path);
    if (filePaths.length === 0) {
      return res.status(404).json({ message: "Không có file nào để tải." });
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

    return res.status(200).json({ signedUrl }); // Trả về signedUrl thay vì redirect
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu file:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi tải dữ liệu file.", error: error.message });
  }
};

// Hàm lấy tất cả bài tập theo classroom_id
const getAllAssignments = async (req, res) => {
  try {
    const { classroom_id } = req.params;

    if (!classroom_id) {
      return res.status(400).json({ message: "Vui lòng cung cấp classroom_id." });
    }

    const assignments = await Assignment.findAll({
      include: [
        {
          model: UserParticipation,
          attributes: ["classroom_id"],
          where: { classroom_id },
          required: true,
        },
      ],
    });

    if (assignments.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy bài tập nào cho classroom_id này." });
    }

    res.status(200).json({
      message: "Lấy danh sách bài tập thành công!",
      assignments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi lấy danh sách bài tập.", error });
  }
};

// Hàm lấy user_participation_id
const getUserParticipationId = async (req, res) => {
  try {
    const { userId, classroomId } = req.params;
    const participation = await UserParticipation.findOne({
      where: { user_id: userId, classroom_id: classroomId },
    });

    if (!participation) {
      return res.status(404).json({ message: "Không tìm thấy user_participation_id" });
    }

    res.status(200).json({ user_participation_id: participation.participate_id });
  } catch (error) {
    console.error("Lỗi khi lấy user_participation_id:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Hàm cập nhật bài tập
const updateAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { title, description, start_assignment, end_assignment, removeFileIndices } = req.body;

    if (!assignment_id || isNaN(assignment_id)) {
      return res.status(400).json({ message: "assignment_id không hợp lệ." });
    }

    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) return res.status(404).json({ message: "Không tìm thấy bài tập." });

  

    if (!title) return res.status(400).json({ message: "Tiêu đề (title) là trường bắt buộc." });

    let filePaths;
    try {
      filePaths = assignment.file_path ? JSON.parse(assignment.file_path) : [];
    } catch (e) {
      return res.status(500).json({ message: "Dữ liệu file_path không hợp lệ." });
    }

    if (removeFileIndices) {
      let indices = [];
      try {
        indices = Array.isArray(removeFileIndices) ? removeFileIndices : JSON.parse(removeFileIndices || "[]");
        if (!indices.every(i => typeof i === "number" && i >= 0)) {
          return res.status(400).json({ message: "removeFileIndices chứa giá trị không hợp lệ." });
        }
      } catch (e) {
        return res.status(400).json({ message: "removeFileIndices không đúng định dạng JSON." });
      }
      for (const index of indices.sort((a, b) => b - a)) {
        if (index >= 0 && index < filePaths.length) {
          const filePath = filePaths[index];
          const { error } = await supabase.storage.from("lms-bucket").remove([filePath]);
          if (error) throw new Error(`Xóa file thất bại: ${error.message}`);
          filePaths.splice(index, 1);
        }
      }
    }

    if (req.files && req.files.length > 0) {
      const newFiles = await uploadFilesToSupabase(req.files);
      filePaths = [...filePaths, ...newFiles.map(f => f.path)];
    }

    const newStart = start_assignment ? new Date(start_assignment) : assignment.start_assignment;
    const newEnd = end_assignment ? new Date(end_assignment) : assignment.end_assignment;
    if (start_assignment && isNaN(newStart.getTime())) {
      return res.status(400).json({ message: "start_assignment không hợp lệ." });
    }
    if (end_assignment && isNaN(newEnd.getTime())) {
      return res.status(400).json({ message: "end_assignment không hợp lệ." });
    }

    await assignment.update({
      title,
      description,
      start_assignment: newStart,
      end_assignment: newEnd,
      file_path: JSON.stringify(filePaths),
    });

    await assignment.reload();

    res.status(200).json({
      message: "Chỉnh sửa bài tập thành công!",
      assignment,
    });
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi chỉnh sửa bài tập.", error: error.message });
  }
};
// Hàm xóa bài tập
const deleteAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) return res.status(404).json({ message: "Không tìm thấy bài tập." });

    const filePaths = parseFilePath(assignment.file_path);
    if (filePaths.length > 0) {
      await supabase.storage.from("lms-bucket").remove(filePaths);
    }

    await assignment.destroy();

    res.status(200).json({ message: "Xóa bài tập thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa bài tập.", error: error.message });
  }
};

// Hàm lấy danh sách bài tập chưa nộp
const getPendingAssignments = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId || !Number.isInteger(Number(userId))) {
      return res.status(400).json({ message: "ID sinh viên không hợp lệ" });
    }

    const studentParticipations = await UserParticipation.findAll({
      where: { user_id: userId },
      attributes: ["classroom_id"],
      raw: true,
    });

    const studentClassroomIds = studentParticipations.map(p => p.classroom_id);

    if (studentClassroomIds.length === 0) {
      return res.status(200).json({
        message: "Sinh viên không tham gia lớp nào",
        assignments: [],
      });
    }

    const assignments = await Assignment.findAll({
      include: [
        {
          model: UserParticipation,
          attributes: ["classroom_id"],
          required: true,
          include: [
            {
              model: Classroom,
              attributes: ["classroom_id"],
              include: [
                { model: Class, attributes: ["class_name"] },
                { model: Course, attributes: ["course_name"] },
              ],
            },
          ],
        },
        {
          model: Submission,
          where: { user_id: userId },
          required: false,
        },
      ],
      where: {
        "$submissions.submission_id$": { [Op.is]: null },
        "$user_participation.classroom_id$": { [Op.in]: studentClassroomIds },
      },
      attributes: [
        "assignment_id",
        "title",
        "description",
        "start_assignment",
        "end_assignment",
        "file_path",
      ],
    });

    res.status(200).json({
      message: "Lấy danh sách bài tập chưa làm thành công!",
      assignments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài chưa làm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Hàm lấy chi tiết bài tập
const getAssignmentDetail = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId, 10);
    if (isNaN(assignmentId)) {
      return res.status(400).json({ message: "ID bài tập không hợp lệ" });
    }

    const assignment = await Assignment.findOne({
      where: { assignment_id: assignmentId },
      include: [
        {
          model: UserParticipation,
          attributes: ["classroom_id"],
        },
      ],
      attributes: [
        "assignment_id",
        "title",
        "description",
        "start_assignment",
        "end_assignment",
        "file_path",
      ],
    });

    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy bài tập" });
    }

    res.status(200).json({
      message: "Lấy chi tiết bài tập thành công!",
      assignment,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài tập:", error);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết bài tập", error: error.message });
  }
};

// Xuất module
module.exports = {
  uploadAssignment,
  downloadAssignmentFiles,
  getAllAssignments,
  getUserParticipationId,
  updateAssignment,
  deleteAssignment,
  getPendingAssignments,
  getAssignmentDetail,
};
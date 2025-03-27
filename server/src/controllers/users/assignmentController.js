const {
  Assignment,
  UserParticipation,
  Class,
  Classroom,
  Course,
  Notification,
  UserNotification,
} = require("../../models/index");
const fsPromises = require("fs").promises; // Để dùng access và readFile
const fs = require("fs"); // Để dùng createReadStream
const path = require("path");
const archiver = require("archiver");
const { getIO } = require("../../config/socket");

// Hàm hỗ trợ để parse file_path an toàn
const parseFilePath = (filePath) => {
  try {
    // Nếu filePath rỗng hoặc không phải chuỗi, trả về mảng rỗng
    if (!filePath || typeof filePath !== "string") {
      return [];
    }
    // Nếu filePath là chuỗi JSON hợp lệ (bắt đầu bằng [ và kết thúc bằng ])
    if (filePath.startsWith("[") && filePath.endsWith("]")) {
      return JSON.parse(filePath);
    }
    // Nếu không phải JSON, coi như là một đường dẫn đơn và trả về dưới dạng mảng
    return [filePath];
  } catch (error) {
    console.error(
      "Lỗi khi parse file_path:",
      error.message,
      "filePath:",
      filePath
    );
    // Nếu parse thất bại, trả về như một mảng chứa một phần tử
    return typeof filePath === "string" ? [filePath] : [];
  }
};

// Hàm upload bài tập
exports.uploadAssignment = async (req, res) => {
  try {
    const {
      user_participation_id,
      title,
      description,
      start_assignment,
      end_assignment,
      user_id,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!user_participation_id || !title || !user_id) {
      return res.status(400).json({
        message:
          "Vui lòng cung cấp đầy đủ user_participation_id, title và user_id.",
      });
    }

    // Kiểm tra xem có file nào được upload không
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng upload ít nhất một file." });
    }

    // Lấy danh sách đường dẫn file đã upload
    const file_paths = req.files.map((file) => file.path);
    // Tạo bản ghi mới trong bảng assignments
    const newAssignment = await Assignment.create({
      user_participation_id,
      title,
      description,
      start_assignment: start_assignment ? new Date(start_assignment) : null,
      end_assignment: end_assignment ? new Date(end_assignment) : null,
      user_id,

      file_path: JSON.stringify(file_paths), // Lưu mảng đường dẫn dưới dạng JSON
    });

    res.status(201).json({
      message: "Upload bài tập thành công!",
      assignment: newAssignment,
    });
  } catch (error) {
    console.error("Lỗi khi upload bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi upload bài tập." });
  }
};

// Hàm tải file
exports.downloadAssignmentFiles = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { fileIndex } = req.query; // Thêm query parameter để chọn file cụ thể

    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy bài tập." });
    }

    const filePaths = JSON.parse(assignment.file_path);

    if (fileIndex !== undefined) {
      const index = parseInt(fileIndex, 10);
      if (isNaN(index) || index < 0 || index >= filePaths.length) {
        return res.status(400).json({ message: "Chỉ số file không hợp lệ." });
      }

      const filePath = filePaths[index];
      const absolutePath = path.resolve(filePath);
      await fsPromises.access(absolutePath);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");
      return fs.createReadStream(absolutePath).pipe(res);
    }

    if (filePaths.length === 1) {
      const filePath = filePaths[0];
      const absolutePath = path.resolve(filePath);
      await fsPromises.access(absolutePath);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");
      return fs.createReadStream(absolutePath).pipe(res);
    }

    if (filePaths.length > 1) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="assignment_${assignment_id}.zip"`
      );
      res.setHeader("Content-Type", "application/zip");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.pipe(res);

      for (const filePath of filePaths) {
        const absolutePath = path.resolve(filePath);
        await fsPromises.access(absolutePath);
        archive.file(absolutePath, { name: path.basename(filePath) });
      }

      await archive.finalize();
      return;
    }

    return res.status(400).json({ message: "Không có file nào để tải." });
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu file:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi tải dữ liệu file." });
  }
};
// Hàm lấy tất cả bài tập với classroom_id
// Hàm lấy bài tập theo classroom_id từ params
exports.getAllAssignments = async (req, res) => {
  try {
    const { classroom_id } = req.params; // Lấy classroom_id từ params

    // Kiểm tra xem classroom_id có được cung cấp không
    if (!classroom_id) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp classroom_id." });
    }

    // Lấy tất cả bài tập theo classroom_id
    const assignments = await Assignment.findAll({
      include: [
        {
          model: UserParticipation,
          attributes: ["classroom_id"], // Chỉ lấy classroom_id
          where: { classroom_id: classroom_id }, // Lọc theo classroom_id
          required: true, // INNER JOIN để chỉ lấy các bài tập có classroom_id khớp
        },
      ],
    });

    // Kiểm tra nếu không có bài tập nào
    if (assignments.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bài tập nào cho classroom_id này." });
    }

    // Trả về danh sách bài tập
    res.status(200).json({
      message: "Lấy danh sách bài tập thành công!",
      assignments: assignments,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài tập:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi lấy danh sách bài tập.", error });
  }
};

exports.getUserParticipationId = async (req, res) => {
  try {
    const { userId, classroomId } = req.params;
    const participation = await UserParticipation.findOne({
      where: {
        user_id: userId,
        classroom_id: classroomId,
      },
    });

    if (!participation) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy user_participation_id" });
    }

    res
      .status(200)
      .json({ user_participation_id: participation.participate_id });
  } catch (error) {
    console.error("Lỗi khi lấy user_participation_id:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const {
      title,
      description,
      start_assignment,
      end_assignment,
      removeFileIndices, // Mảng chỉ số file cần xóa (từ frontend)
    } = req.body;

    if (!assignment_id) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp assignment_id." });
    }
    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy bài tập." });
    }

    if (!title) {
      return res
        .status(400)
        .json({ message: "Tiêu đề (title) là trường bắt buộc." });
    }

    let file_paths = JSON.parse(assignment.file_path || "[]");

    // Xóa file nếu có chỉ số được gửi từ frontend
    if (removeFileIndices) {
      const indices = JSON.parse(removeFileIndices); // Parse từ chuỗi JSON
      indices.sort((a, b) => b - a); // Sắp xếp giảm dần để xóa từ cuối mảng
      for (const index of indices) {
        if (index >= 0 && index < file_paths.length) {
          const filePath = file_paths[index];
          try {
            await fsPromises.unlink(path.resolve(filePath)); // Xóa file vật lý
          } catch (err) {
            console.error(`Không thể xóa file ${filePath}:`, err);
          }
          file_paths.splice(index, 1); // Xóa đường dẫn khỏi mảng
        }
      }
    }

    // Thêm file mới nếu có
    if (req.files && req.files.length > 0) {
      const newFilePaths = req.files.map((file) => file.path);
      file_paths = [...file_paths, ...newFilePaths]; // Thêm file mới vào mảng
    }

    await assignment.update({
      title,
      description,
      start_assignment: start_assignment
        ? new Date(start_assignment)
        : assignment.start_assignment,
      end_assignment: end_assignment
        ? new Date(end_assignment)
        : assignment.end_assignment,
      file_path: JSON.stringify(file_paths),
    });

    res.status(200).json({
      message: "Chỉnh sửa bài tập thành công!",
      assignment: assignment,
    });
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa bài tập:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi chỉnh sửa bài tập." });
  }
};
// Hàm xóa bài tập
// Hàm xóa bài tập
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    if (!assignment_id) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp assignment_id." });
    }

    const assignment = await Assignment.findByPk(assignment_id);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy bài tập." });
    }

    // Sử dụng parseFilePath an toàn
    const filePaths = parseFilePath(assignment.file_path);

    // Xóa các file vật lý
    for (const filePath of filePaths) {
      try {
        const absolutePath = path.resolve(filePath);
        await fsPromises.access(absolutePath); // Kiểm tra file tồn tại
        await fsPromises.unlink(absolutePath); // Xóa file
      } catch (err) {
        console.error(`Không thể xóa file ${filePath}:`, err.message);
      }
    }

    // Xóa bản ghi bài tập
    await assignment.destroy();

    res.status(200).json({ message: "Xóa bài tập thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa bài tập:", error.message, error.stack);
    res.status(500).json({ message: "Có lỗi xảy ra khi xóa bài tập." });
  }
};

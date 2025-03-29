const { Classroom, UserParticipation, User, Role } = require("../../models/index");

const getAllStudentsInClassroom = async (req, res) => {
  const { classroomId } = req.params;
  try {
    const classroom = await Classroom.findOne({
      where: { classroom_id: classroomId },
      include: [
        {
          model: User,
          where: { role_id: 1 },
          through: UserParticipation,
          include: [
            {
              model: Role,
              attributes: ["role_name"],
            },
          ],
        },
      ],
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom không tồn tại",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lấy tất cả sinh viên trực thuộc classroom thành công!",
      data: classroom.Users, // Trả về danh sách sinh viên
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllStudentsInClassroom };

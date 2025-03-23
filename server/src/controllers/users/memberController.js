const { Classroom, UserParticipation, User } = require("../../models/index");

const getAllStudentsInClassroom = async (req, res) => {
  const {classroomId}= req.params;
  try {
    const classroom = await Classroom.findOne({
      where: { classroom_id: classroomId },
      include: [
        {
          model: User,
          through: UserParticipation,
        },
      ],
    });
    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom không tồn tại",
      });
    }

    // Lấy danh sách user trực thuộc classroom
    const students = classroom.Users;

    res.status(200).json({
      success: true,
      message: "Lấy tất cả sinh viên trực thuộc classroom thành công!",
      data: students,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllStudentsInClassroom };

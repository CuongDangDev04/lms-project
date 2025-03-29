const { Op } = require("sequelize");
const { UserParticipation, Assignment, Submission, Grade, User } = require("../../models/index");

const getClassGrades = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classroomId = req.params.classroomId;

        // Kiểm tra xem giảng viên có dạy lớp này không
        const teacherParticipation = await UserParticipation.findOne({
            where: { user_id: teacherId, classroom_id: classroomId },
        });
        if (!teacherParticipation) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập lớp này" });
        }

        // Lấy danh sách sinh viên trong lớp
        const students = await UserParticipation.findAll({
            where: { classroom_id: classroomId },
            include: [
                {
                    model: User,
                    where: { role_id: 1 },
                    attributes: ["user_id", "fullname", "email", "username"],
                },
            ],
        });

        // Lấy danh sách bài tập của lớp
        const assignments = await Assignment.findAll({
            where: { user_participation_id: teacherParticipation.participate_id },
            attributes: ["assignment_id", "title"],
        });

        // Lấy điểm số của từng sinh viên
        const studentGrades = await Promise.all(
            students.map(async (student) => {
                const userId = student.User.user_id;
                console.log("userId", userId);
                // const grades = await Submission.findAll({
                //     where: { user_id: userId },
                //     include: [
                //         {
                //             model: Grade,
                //             attributes: ["score", "feedback"],
                //         },
                //         {
                //             model: Assignment,
                //             where: { user_participation_id: teacherParticipation.participate_id },
                //             attributes: ["assignment_id"],
                //         },
                //     ],
                // });

                const grades = await Grade.findAll({
                    include: [
                        {
                            model: Submission,
                            where: { user_id: userId },
                        },
                        {
                            model: Assignment,
                            where: { user_participation_id: teacherParticipation.participate_id },
                            attributes: ["assignment_id", "title"],
                        },
                    ],
                });

                console.log("grades", grades);

                // Tạo object điểm số cho từng bài tập
                const gradeMap = {};
                grades.forEach((grade) => {
                    const assignmentId = grade.Assignment.assignment_id;
                    const score = grade.score;
                    const feedback = grade.feedback;

                    if (!gradeMap[assignmentId]) {
                        gradeMap[assignmentId] = {
                            score: null,
                            feedback: null,
                        };
                    }

                    gradeMap[assignmentId].score = score;
                    gradeMap[assignmentId].feedback = feedback;
                });

                console.log("gradeMap", gradeMap);

                return {
                    user_id: userId,
                    fullname: student.User.fullname,
                    email: student.User.email,
                    username: student.User.username,
                    grades: gradeMap,
                };
            })
        );

        res.status(200).json({
            message: "Lấy danh sách điểm số thành công",
            classroomId,
            assignments,
            students: studentGrades,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách điểm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = { getClassGrades };
const { Op } = require("sequelize");
const { UserParticipation, Assignment, Submission, Grade, User, Result, Exam } = require("../../models/index");

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

        // Lấy danh sách tất cả bài thi của lớp
        const exams = await Exam.findAll({
            where: { classroom_id: classroomId },
            attributes: ["exam_id", "title"],
        });

        // Lấy điểm số của từng sinh viên
        const studentGrades = await Promise.all(
            students.map(async (student) => {
                const userId = student.User.user_id;
                const studentParticipation = await UserParticipation.findOne({
                    where: { user_id: userId, classroom_id: classroomId }
                });

                // Lấy điểm bài tập
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

                // Tạo object điểm số cho bài tập
                const assignmentGradeMap = {};
                let totalAssignmentScore = 0;
                let assignmentCount = 0;

                grades.forEach((grade) => {
                    const assignmentId = grade.Assignment.assignment_id;
                    const score = grade.score;
                    const feedback = grade.feedback;

                    if (!assignmentGradeMap[assignmentId]) {
                        assignmentGradeMap[assignmentId] = {
                            score: null,
                            feedback: null,
                        };
                    }

                    assignmentGradeMap[assignmentId].score = score;
                    assignmentGradeMap[assignmentId].feedback = feedback;
                    totalAssignmentScore += parseInt(score) || 0;
                    if (score !== null) assignmentCount++;
                });

                // Tính điểm trung bình bài tập
                const assignmentAverage = assignmentCount > 0 ? totalAssignmentScore / assignmentCount : 0;

                // Lấy điểm bài thi đã làm
                const examResults = await Result.findAll({
                    where: { participate_id: studentParticipation.participate_id },
                    include: [
                        {
                            model: Exam,
                            where: { classroom_id: classroomId },
                            attributes: ["exam_id", "title"],
                        },
                    ],
                });

                // Tạo object điểm số cho tất cả bài thi (đã làm và chưa làm)
                const examGradeMap = {};
                let totalExamScore = 0;
                let examCount = exams.length;

                // Khởi tạo tất cả bài thi với điểm 0
                exams.forEach((exam) => {
                    examGradeMap[exam.exam_id] = {
                        score: 0,
                        title: exam.title,
                        status: "Chưa làm"
                    };
                });

                // Cập nhật điểm cho các bài thi đã làm
                examResults.forEach((result) => {
                    const examId = result.Exam.exam_id;
                    const score = result.score;

                    examGradeMap[examId] = {
                        score: score / 10,
                        title: result.Exam.title,
                        status: "Đã làm"
                    };
                    totalExamScore += score || 0;
                });

                // Tính điểm trung bình bài thi (bao gồm cả bài chưa làm = 0)
                const examAverage = examCount > 0 ? totalExamScore / examCount : 0;
                const texamAverage = examAverage / 10;
                // Tính điểm trung bình tổng 
                const finalAverage = ((assignmentAverage) + (texamAverage * 2)) / 3;

                return {
                    user_id: userId,
                    fullname: student.User.fullname,
                    email: student.User.email,
                    username: student.User.username,
                    assignment_grades: assignmentGradeMap,
                    exam_grades: examGradeMap,
                    assignment_average: Number(assignmentAverage.toFixed(2)),
                    exam_average: Number(texamAverage.toFixed(2)),
                    final_average: Number(finalAverage.toFixed(2)),
                };
            })
        );

        res.status(200).json({
            message: "Lấy danh sách điểm số thành công",
            classroomId,
            assignments,
            exams,
            students: studentGrades,
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách điểm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

module.exports = { getClassGrades };
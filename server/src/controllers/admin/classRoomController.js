const { Classroom, Class, Course, ClassStatus, Schedule, User, UserParticipation } = require('../../models/index');
const { Op } = require('sequelize');
const { parseExcelFile } = require('../../services/excelService');

// Tạo lớp học phần
const createClassroom = async (req, res) => {
    try {
        const { class_id, course_id, status_id, start_date, end_date, max_capacity } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!class_id || !course_id || !status_id || !start_date || !end_date) {
            return res.status(400).json({
                error: 'Yêu cầu cung cấp đầy đủ thông tin: class_id, course_id, status_id, start_date, end_date',
            });
        }

        // Kiểm tra class_id
        const classExists = await Class.findByPk(class_id);
        if (!classExists) {
            return res.status(404).json({ error: 'Lớp học không tồn tại' });
        }

        // Kiểm tra course_id
        const courseExists = await Course.findByPk(course_id);
        if (!courseExists) {
            return res.status(404).json({ error: 'Khóa học không tồn tại' });
        }

        // Kiểm tra status_id
        const statusExists = await ClassStatus.findByPk(status_id);
        if (!statusExists) {
            return res.status(404).json({ error: 'Trạng thái không tồn tại' });
        }

        // Kiểm tra ngày bắt đầu và kết thúc
        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'Thời gian bắt đầu phải sớm hơn thời gian kết thúc' });
        }

        // Tạo lớp học phần
        const classroom = await Classroom.create({
            class_id,
            course_id,
            status_id,
            start_date,
            end_date,
            max_capacity: max_capacity || 30, // Nếu không truyền max_capacity, mặc định là 30
        });

        return res.status(201).json({
            message: 'Tạo lớp học phần thành công',
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi khi tạo lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy danh sách tất cả lớp học phần
const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.findAll({
            include: [
                { model: Class, attributes: ['class_id', 'class_name'] },
                { model: Course, attributes: ['course_id', 'course_name', 'course_code'] },
                { model: ClassStatus, attributes: ['status_id', 'status_name'] },
                { model: Schedule, attributes: ['schedule_id', 'event_type', 'start_time', 'end_time'] },
            ],
            attributes: ['classroom_id', 'class_id', 'course_id', 'status_id', 'start_date', 'end_date', 'max_capacity'],
        });

        // Lấy số lượng sinh viên cho từng lớp
        const updatedClassrooms = await Promise.all(
            classrooms.map(async (classroom) => {
                const studentCount = await UserParticipation.count({
                    where: { classroom_id: classroom.classroom_id },
                    include: [{ model: User, where: { role_id: 1 } }],
                });
                return {
                    ...classroom.toJSON(),
                    student_count: studentCount,
                };
            })
        );

        return res.status(200).json(updatedClassrooms);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy thông tin lớp học phần theo ID
const getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findByPk(id, {
            include: [
                { model: Class, attributes: ['class_id', 'class_name'] },
                { model: Course, attributes: ['course_id', 'course_name'] },
                { model: ClassStatus, attributes: ['status_id', 'status_name'] },
                { model: Schedule, attributes: ['schedule_id', 'event_type', 'start_time', 'end_time'] },
            ],
            attributes: ['classroom_id', 'class_id', 'course_id', 'status_id', 'start_date', 'end_date', 'max_capacity'],
        });

        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        // Lấy số lượng sinh viên
        const studentCount = await UserParticipation.count({
            where: { classroom_id: classroom.classroom_id },
            include: [{ model: User, where: { role_id: 1 } }],
        });

        return res.status(200).json({
            message: 'Lấy thông tin lớp học phần thành công',
            data: {
                ...classroom.toJSON(),
                student_count: studentCount,
            },
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Cập nhật lớp học phần
const updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_id, course_id, status_id, start_date, end_date, max_capacity } = req.body;

        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        // Kiểm tra class_id nếu có
        if (class_id) {
            const classExists = await Class.findByPk(class_id);
            if (!classExists) {
                return res.status(404).json({ error: 'Lớp học không tồn tại' });
            }
        }

        // Kiểm tra course_id nếu có
        if (course_id) {
            const courseExists = await Course.findByPk(course_id);
            if (!courseExists) {
                return res.status(404).json({ error: 'Khóa học không tồn tại' });
            }
        }

        // Kiểm tra status_id nếu có
        if (status_id) {
            const statusExists = await ClassStatus.findByPk(status_id);
            if (!statusExists) {
                return res.status(404).json({ error: 'Trạng thái không tồn tại' });
            }
        }

        // Kiểm tra ngày bắt đầu và kết thúc nếu có
        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'Thời gian bắt đầu phải sớm hơn thời gian kết thúc' });
        }

        // Kiểm tra max_capacity nếu có
        if (max_capacity) {
            const currentStudentCount = await UserParticipation.count({
                where: { classroom_id: classroom.classroom_id },
                include: [{ model: User, where: { role_id: 1 } }],
            });
            if (currentStudentCount > max_capacity) {
                return res.status(400).json({
                    error: `Số lượng sinh viên hiện tại (${currentStudentCount}) vượt quá giới hạn mới (${max_capacity})`,
                });
            }
        }

        // Cập nhật lớp học phần
        await classroom.update({
            class_id: class_id || classroom.class_id,
            course_id: course_id || classroom.course_id,
            status_id: status_id || classroom.status_id,
            start_date: start_date || classroom.start_date,
            end_date: end_date || classroom.end_date,
            max_capacity: max_capacity || classroom.max_capacity,
        });

        return res.status(200).json({
            message: 'Cập nhật lớp học phần thành công',
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Xóa lớp học phần
const deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        // Kiểm tra xem lớp học phần có sinh viên hoặc lịch học không
        const studentCount = await UserParticipation.count({
            where: { classroom_id: classroom.classroom_id },
        });
        const scheduleCount = await Schedule.count({
            where: { classroom_id: classroom.classroom_id },
        });

        if (studentCount > 0 || scheduleCount > 0) {
            return res.status(400).json({
                error: 'Không thể xóa lớp học phần vì đã có sinh viên hoặc lịch học liên quan',
            });
        }

        await classroom.destroy();

        return res.status(200).json({
            message: 'Xóa lớp học phần thành công',
        });
    } catch (error) {
        console.error('Lỗi khi xóa lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy danh sách sinh viên của một lớp học phần
const getStudentsByClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params;

        // Kiểm tra lớp học phần có tồn tại không
        const classroom = await Classroom.findByPk(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Lớp học phần không tồn tại' });
        }

        // Lấy danh sách sinh viên thông qua bảng UserParticipation
        const classroomStudents = await UserParticipation.findAll({
            where: { classroom_id: classroomId },
            include: [
                {
                    model: User,
                    where: { role_id: 1 }, // Chỉ lấy sinh viên (giả sử role_id = 1 là sinh viên)
                    attributes: ['user_id', 'username', 'email', 'fullname', 'birth', 'gender'],
                },
            ],
        });

        // Định dạng dữ liệu trả về
        const students = classroomStudents.map(cs => ({
            id: cs.User.user_id,
            student_code: cs.User.username, // Giả sử username là mã sinh viên
            fullname: cs.User.fullname,
            email: cs.User.email,
            birth: cs.User.birth,
            gender: cs.User.gender,
        }));

        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sinh viên', error: error.message });
    }
};

// Thêm một sinh viên vào lớp học phần
const addStudentToClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { student_id } = req.body;

        // Kiểm tra lớp học phần có tồn tại không
        const classroom = await Classroom.findByPk(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Lớp học phần không tồn tại' });
        }

        // Kiểm tra sinh viên có tồn tại và có phải là sinh viên không
        console.log('Received student_id (username):', student_id);
        const student = await User.findOne({ where: { username: student_id, role_id: 1 } });
        if (!student) {
            return res.status(404).json({ message: 'Sinh viên không tồn tại hoặc không phải là sinh viên' });
        }

        console.log('Found student:', student.toJSON());

        // Lấy user_id từ student
        const userId = student.user_id;

        // Kiểm tra số lượng sinh viên hiện tại
        const currentStudentCount = await UserParticipation.count({
            where: { classroom_id: classroomId },
            include: [{ model: User, where: { role_id: 1 } }],
        });
        if (currentStudentCount >= classroom.max_capacity) {
            return res.status(400).json({ message: 'Lớp học phần đã đạt giới hạn số lượng sinh viên' });
        }

        // Kiểm tra sinh viên đã có trong lớp chưa
        const existing = await UserParticipation.findOne({
            where: { classroom_id: classroomId, user_id: userId },
        });
        if (existing) {
            return res.status(400).json({ message: 'Sinh viên đã có trong lớp học phần này' });
        }

        // Thêm sinh viên vào lớp
        await UserParticipation.create({ classroom_id: classroomId, user_id: userId });
        res.status(201).json({ message: 'Thêm sinh viên thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm sinh viên', error: error.message });
    }
};

const importStudentsToClassroom = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Vui lòng tải lên file Excel' });
        }

        const classroom = await Classroom.findByPk(classroomId);
        if (!classroom) {
            return res.status(404).json({ message: 'Lớp học phần không tồn tại' });
        }

        const currentStudentCount = await UserParticipation.count({
            where: { classroom_id: classroomId },
            include: [{ model: User, where: { role_id: 1 } }],
        });

        let studentsData;
        try {
            studentsData = parseExcelFile(file);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }

        // Kiểm tra cột username thay vì student_code
        if (!studentsData.every(student => student.username)) {
            return res.status(400).json({ message: 'File Excel phải chứa cột "username"' });
        }

        let addedCount = 0;
        for (const studentData of studentsData) {
            if (currentStudentCount + addedCount >= classroom.max_capacity) {
                return res.status(400).json({ message: 'Lớp học phần đã đạt giới hạn số lượng sinh viên' });
            }

            // Tìm sinh viên theo username
            const student = await User.findOne({
                where: { username: studentData.username, role_id: 1 },
            });

            if (student) {
                const existing = await UserParticipation.findOne({
                    where: { classroom_id: classroomId, user_id: student.user_id },
                });
                if (!existing) {
                    await UserParticipation.create({ classroom_id: classroomId, user_id: student.user_id });
                    addedCount++;
                }
            } else {
                console.warn(`Không tìm thấy sinh viên với mã ${studentData.username}`);
            }
        }

        if (addedCount === 0) {
            return res.status(400).json({ message: 'Không có sinh viên nào được thêm (có thể do mã sinh viên không tồn tại hoặc đã có trong lớp)' });
        }

        res.status(200).json({ message: `Nhập thành công ${addedCount} sinh viên` });
    } catch (error) {
        console.error('Lỗi khi nhập danh sách sinh viên:', error);
        res.status(500).json({ message: 'Lỗi khi nhập danh sách sinh viên', error: error.message });
    }
};
// Lấy danh sách lớp học phần (để hoàn thiện các API khác)
const getClassrooms = async (req, res) => {
    try {
        const { type } = req.query;
        const classrooms = await Classroom.findAll({
            include: [
                { model: Course, attributes: ['course_id', 'course_name'] },
                { model: ClassStatus, attributes: ['status_id', 'status_name'] },
            ],
            attributes: ['classroom_id', 'class_id', 'course_id', 'status_id', 'start_date', 'end_date', 'max_capacity'],
        });

        // Lấy số lượng sinh viên cho từng lớp
        const updatedClassrooms = await Promise.all(
            classrooms.map(async (classroom) => {
                const studentCount = await UserParticipation.count({
                    where: { classroom_id: classroom.classroom_id },
                    include: [{ model: User, where: { role_id: 1 } }],
                });
                return {
                    ...classroom.toJSON(),
                    student_count: studentCount,
                };
            })
        );

        res.status(200).json(updatedClassrooms);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách lớp học phần', error: error.message });
    }
};

module.exports = {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    getStudentsByClassroom,
    addStudentToClassroom,
    importStudentsToClassroom,
    getClassrooms,
};
const { Classroom, Class, Course, ClassStatus, Schedule } = require('../../models/index')
const { Op } = require('sequelize');

const createClassroom = async (req, res) => {
    try {
        const { class_id, course_id, status_id, start_date, end_date } = req.body;

        if (!class_id || !course_id || !status_id || !start_date || !end_date) {
            return res.status(400).json({
                error: 'Yêu cầu cung cấp đầy đủ thông tin: class_id, course_id, status_id, start_date, end_date',
            });
        }

        const classExists = await Class.findByPk(class_id);
        if (!classExists) {
            return res.status(404).json({ error: 'Lớp học không tồn tại' });
        }

        const courseExists = await Course.findByPk(course_id);
        if (!courseExists) {
            return res.status(404).json({ error: 'Khóa học không tồn tại' });
        }

        const statusExists = await ClassStatus.findByPk(status_id);
        if (!statusExists) {
            return res.status(404).json({ error: 'Trạng thái không tồn tại' });
        }

        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'Thời gian bắt đầu phải sớm hơn thời gian kết thúc' });
        }

        const classroom = await Classroom.create({
            class_id,
            course_id,
            status_id,
            start_date,
            end_date,
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

const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.findAll({
            include: [
                { model: Class },
                { model: Course },
                { model: ClassStatus, as: 'ClassStatus' },
                { model: Schedule, as: 'Schedules' },
            ],
        });

        return res.status(200).json(classrooms)
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findByPk(id, {
            include: [
                { model: Class },
                { model: Course },
                { model: ClassStatus },
                { model: Schedule },
            ],
        });

        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        return res.status(200).json({
            message: 'Lấy thông tin lớp học phần thành công',
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const { class_id, course_id, status_id, start_date, end_date } = req.body;

        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        if (class_id) {
            const classExists = await Class.findByPk(class_id);
            if (!classExists) {
                return res.status(404).json({ error: 'Lớp học không tồn tại' });
            }
        }

        if (course_id) {
            const courseExists = await Course.findByPk(course_id);
            if (!courseExists) {
                return res.status(404).json({ error: 'Khóa học không tồn tại' });
            }
        }

        if (status_id) {
            const statusExists = await ClassStatus.findByPk(status_id);
            if (!statusExists) {
                return res.status(404).json({ error: 'Trạng thái không tồn tại' });
            }
        }

        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'Thời gian bắt đầu phải sớm hơn thời gian kết thúc' });
        }

        await classroom.update({
            class_id: class_id || classroom.class_id,
            course_id: course_id || classroom.course_id,
            status_id: status_id || classroom.status_id,
            start_date: start_date || classroom.start_date,
            end_date: end_date || classroom.end_date,
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

const deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
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

module.exports = {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom
}
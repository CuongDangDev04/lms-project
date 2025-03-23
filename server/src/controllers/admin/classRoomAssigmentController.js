const { Classroom, User, UserParticipation, Schedule, ClassStatus, Class, Course } = require('../../models/index');
const { Op } = require('sequelize');
let { addWeeks, startOfDay, isWithinInterval, format, isValid } = require('date-fns');

// Phân công giảng viên cho lớp học phần
const assignTeacherToClassroom = async (req, res) => {
    try {
        const { classroom_id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'Yêu cầu cung cấp user_id của giảng viên' });
        }

        const classroom = await Classroom.findByPk(classroom_id);
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        const teacher = await User.findOne({
            where: { user_id, role_id: 2 },
            attributes: ['user_id', 'role_id'],
        });
        if (!teacher) {
            return res.status(404).json({ error: 'Giảng viên không tồn tại hoặc không có vai trò phù hợp' });
        }

        const existingAssignment = await UserParticipation.findOne({
            where: { user_id, classroom_id },
            attributes: ['participate_id'],
        });
        if (existingAssignment) {
            return res.status(400).json({ error: 'Giảng viên đã được phân công cho lớp học phần này' });
        }

        const assignment = await UserParticipation.create({
            user_id,
            classroom_id,
        });

        return res.status(201).json({
            message: 'Phân công giảng viên thành công',
            data: assignment,
        });
    } catch (error) {
        console.error('Lỗi khi phân công giảng viên:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Tạo lịch học cho lớp học phần
const createScheduleForClassroom = async (req, res) => {
    try {
        const { classroom_id } = req.params;
        const { event_type, weekdays, start_time, end_time, description, start_date, end_date, exam_date } = req.body;

        const classroom = await Classroom.findByPk(classroom_id);
        if (!classroom) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học phần.' });
        }

        const startDate = start_date ? new Date(start_date) : new Date(classroom.start_date);
        const endDate = end_date ? new Date(end_date) : new Date(classroom.end_date);

        if (!isValid(startDate) || !isValid(endDate)) {
            return res.status(400).json({ message: 'Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.' });
        }

        if (event_type === 'Thi') {
            await Schedule.create({
                classroom_id,
                event_type: 'Thi',
                start_time,
                end_time,
                description,
                exam_date,
                date: exam_date,
                is_postponed: false,
                makeup_date: null,
            });
            return res.status(201).json({ message: 'Tạo lịch thi thành công.' });
        } else {
            const selectedWeekday = parseInt(weekdays, 10);
            const jsWeekday = selectedWeekday === 8 ? 0 : selectedWeekday - 1;

            let currentDate = new Date(startDate);
            const createdSchedules = [];
            while (currentDate <= endDate) {
                if (currentDate.getDay() === jsWeekday) {
                    const schedule = await Schedule.create({
                        classroom_id,
                        event_type: 'Học',
                        start_time,
                        end_time,
                        description,
                        date: format(currentDate, 'yyyy-MM-dd'),
                        is_postponed: false,
                        makeup_date: null,
                    });
                    createdSchedules.push(schedule);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return res.status(201).json({ message: 'Tạo lịch học thành công.', data: createdSchedules });
        }
    } catch (error) {
        console.error('Lỗi khi tạo lịch học:', error.message, error.stack);
        res.status(500).json({ message: 'Lỗi server khi tạo lịch học.', error: error.message });
    }
};
// Cập nhật trạng thái lớp học phần
const updateClassroomStatus = async (req, res) => {
    try {
        const { classroom_id } = req.params;
        const { status_id } = req.body;

        if (!status_id) {
            return res.status(400).json({ error: 'Yêu cầu cung cấp status_id' });
        }

        const classroom = await Classroom.findByPk(classroom_id);
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        const status = await ClassStatus.findByPk(status_id, {
            attributes: ['status_id', 'status_name'],
        });
        if (!status) {
            return res.status(404).json({ error: 'Trạng thái không tồn tại' });
        }

        await classroom.update({ status_id });

        return res.status(200).json({
            message: 'Cập nhật trạng thái lớp học phần thành công',
            data: classroom,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy danh sách lớp học phần của giảng viên
const getClassroomsByTeacher = async (req, res) => {
    try {
        const { user_id } = req.params;

        const teacher = await User.findOne({
            where: { user_id, role_id: 2 },
            attributes: ['user_id', 'role_id'],
        });
        if (!teacher) {
            return res.status(404).json({ error: 'Giảng viên không tồn tại hoặc không có vai trò phù hợp' });
        }

        const assignments = await UserParticipation.findAll({
            where: { user_id },
            include: [
                {
                    model: Classroom,
                    as: 'Classroom',
                    include: [
                        { model: Class, attributes: ['class_id', 'class_name'] },
                        { model: Course, attributes: ['course_id', 'course_name'] },
                        { model: ClassStatus, attributes: ['status_id', 'status_name'], as: 'ClassStatus' },
                        { model: Schedule, attributes: ['schedule_id', 'event_type', 'weekdays', 'start_time', 'end_time', 'description'], as: 'Schedules' },
                    ],
                },
            ],
        });

        return res.status(200).json({
            message: 'Lấy danh sách lớp học phần thành công',
            data: assignments,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const updateTeacherAssignment = async (req, res) => {
    try {
        const { classroom_id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'Yêu cầu cung cấp user_id của giảng viên' });
        }

        // Kiểm tra lớp học phần tồn tại
        const classroom = await Classroom.findByPk(classroom_id, {
            include: [{
                model: Schedule,
                as: 'Schedules'
            }],
        });
        if (!classroom) {
            return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
        }

        // Kiểm tra user_id mới là giảng viên (role_id = 2)
        const teacher = await User.findOne({
            where: { user_id, role_id: 2 },
            attributes: ['user_id', 'fullname'],
        });
        if (!teacher) {
            return res.status(404).json({ error: 'Giảng viên không tồn tại hoặc không có vai trò phù hợp' });
        }

        // Tìm bản ghi hiện tại của giảng viên cho lớp học phần này
        const existingTeacherAssignment = await UserParticipation.findOne({
            where: { classroom_id },
            include: [{
                model: User,
                where: { role_id: 2 },
                attributes: ['user_id', 'role_id'],
            }],
        });

        if (existingTeacherAssignment && existingTeacherAssignment.user_id === user_id) {
            return res.status(400).json({ error: 'Giảng viên này đã được phân công cho lớp học phần' });
        }

        // Lấy lịch dạy hiện tại của giảng viên mới (để kiểm tra xung đột)
        const teacherAssignments = await UserParticipation.findAll({
            where: { user_id },
            include: [
                {
                    model: Classroom,
                    as: 'Classroom',
                    include: [
                        { model: Class, attributes: ['class_id', 'class_name'] },
                        { model: Course, attributes: ['course_id', 'course_name'] },
                        { model: ClassStatus, attributes: ['status_id', 'status_name'], as: 'ClassStatus' },
                        { model: Schedule, attributes: ['schedule_id', 'event_type', 'weekdays', 'start_time', 'end_time', 'description'], as: 'Schedules' },
                    ],
                },
            ],
        });

        // Kiểm tra xung đột lịch dạy
        const newClassSchedules = classroom.Schedules;
        const hasConflict = teacherAssignments.some(assignment => {
            const existingSchedules = assignment.Classroom.Schedules;
            return existingSchedules.some(existingSchedule =>
                newClassSchedules.some(newSchedule => {
                    if (assignment.Classroom.classroom_id === classroom_id) return false;
                    const weekdaysOverlap = existingSchedule.weekdays.some(day =>
                        newSchedule.weekdays.includes(day)
                    );
                    const timeOverlap =
                        existingSchedule.start_time < newSchedule.end_time &&
                        existingSchedule.end_time > newSchedule.start_time;
                    return weekdaysOverlap && timeOverlap;
                })
            );
        });

        if (hasConflict) {
            return res.status(400).json({
                error: 'Giảng viên có lịch dạy xung đột với lớp học phần này',
            });
        }

        // Xử lý phân công: Thay thế giảng viên cũ (nếu có) bằng giảng viên mới
        if (existingTeacherAssignment) {
            // Cập nhật bản ghi hiện tại của giảng viên cũ
            await UserParticipation.update(
                { user_id },
                { where: { participate_id: existingTeacherAssignment.participate_id } }
            );
        } else {
            // Nếu chưa có giảng viên, tạo mới bản ghi
            await UserParticipation.create({
                user_id,
                classroom_id,
            });
        }

        const updatedAssignment = await UserParticipation.findOne({
            where: { classroom_id, user_id },
        });

        return res.status(200).json({
            message: 'Cập nhật phân công giảng viên thành công',
            data: updatedAssignment,
        });

    } catch (error) {
        console.error('Lỗi khi cập nhật phân công giảng viên:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};


// Lấy danh sách tất cả lớp học phần đã được phân công
const getAllAssignedClassrooms = async (req, res) => {
    try {
        const assignments = await UserParticipation.findAll({
            include: [
                {
                    model: Classroom,
                    as: 'Classroom',
                    include: [
                        { model: Class, attributes: ['class_id', 'class_name'] },
                        { model: Course, attributes: ['course_id', 'course_name'] },
                        { model: ClassStatus, attributes: ['status_id', 'status_name'], as: 'ClassStatus' },
                        { model: Schedule, attributes: ['schedule_id', 'event_type', 'weekdays', 'start_time', 'end_time', 'description'], as: 'Schedules' },
                    ],
                },
                {
                    model: User,
                    as: 'User',
                    where: { role_id: 2 },
                    attributes: ['user_id', 'username', 'fullname'],
                },
            ],
        });

        if (!assignments.length) {
            return res.status(404).json({ message: 'Không tìm thấy lớp học phần nào đã được phân công' });
        }

        return res.status(200).json({
            message: 'Lấy danh sách lớp học phần đã phân công thành công',
            data: assignments,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học phần:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const getSchedulesByClassroom = async (req, res) => {
    try {
        const { classroom_id } = req.params;

        if (!classroom_id || isNaN(classroom_id)) {
            return res.status(400).json({ message: 'Classroom ID không hợp lệ.' });
        }

        const schedules = await Schedule.findAll({
            where: { classroom_id },
            attributes: ['schedule_id', 'classroom_id', 'event_type', 'date', 'start_time', 'end_time', 'description', 'exam_date', 'is_postponed', 'makeup_date', 'parent_schedule_id'],
        });

        if (!schedules || schedules.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch học cho lớp học phần này.' });
        }

        const formattedSchedules = schedules.map(schedule => ({
            schedule_id: schedule.schedule_id,
            classroom_id: schedule.classroom_id,
            event_type: schedule.event_type,
            date: schedule.date ? format(new Date(schedule.date), 'yyyy-MM-dd') : schedule.exam_date ? format(new Date(schedule.exam_date), 'yyyy-MM-dd') : null,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            description: schedule.description,
            is_postponed: schedule.is_postponed || false,
            makeup_date: schedule.makeup_date ? format(new Date(schedule.makeup_date), 'yyyy-MM-dd') : null,
            parent_schedule_id: schedule.parent_schedule_id,
        }));

        formattedSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));
        res.status(200).json(formattedSchedules);
    } catch (error) {
        console.error('Lỗi khi lấy lịch học:', error.message, error.stack);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch học.', error: error.message });
    }
};

const postponeAndMakeupSchedule = async (req, res) => {
    try {
        const { schedule_id, date } = req.params;
        const { classroom_id } = req.query;
        const { is_postponed, makeup_date } = req.body;

        if (!schedule_id || !date || !classroom_id) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
        }

        // Tìm bản ghi lịch học có schedule_id và ngày cụ thể
        const schedule = await Schedule.findOne({
            where: { schedule_id, classroom_id, date: new Date(date) },
        });
        if (!schedule) {
            return res.status(404).json({ message: 'Lịch học không tồn tại.' });
        }

        const parsedDate = new Date(date);
        if (!isValid(parsedDate)) {
            return res.status(400).json({ message: 'Ngày không hợp lệ.' });
        }

        // Nếu hoãn mà không có ngày bù
        if (is_postponed && !makeup_date) {
            await schedule.update({
                is_postponed: true,
                makeup_date: null,
            });
            return res.status(200).json({ message: 'Hoãn lịch thành công.', data: schedule });
        }

        // Nếu bỏ hoãn
        if (!is_postponed) {
            await Schedule.destroy({
                where: { parent_schedule_id: schedule_id },
            });
            await schedule.update({
                is_postponed: false,
                makeup_date: null,
            });
            return res.status(200).json({ message: 'Bỏ hoãn lịch thành công.', data: schedule });
        }

        // Nếu hoãn và có ngày bù: Tạo lịch bù mới
        if (is_postponed && makeup_date) {
            const makeupDateObj = new Date(makeup_date);
            if (!isValid(makeupDateObj)) {
                return res.status(400).json({ message: 'Ngày bù không hợp lệ.' });
            }

            // Đánh dấu lịch gốc là đã hoãn
            await schedule.update({
                is_postponed: true,
                makeup_date: makeupDateObj,
            });

            // Tạo lịch bù mới
            const makeupSchedule = await Schedule.create({
                classroom_id: schedule.classroom_id,
                event_type: schedule.event_type,
                date: makeupDateObj,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                description: `Lịch bù cho ngày ${format(parsedDate, 'dd/MM/yyyy')}`,
                is_postponed: false,
                makeup_date: null,
                parent_schedule_id: schedule.schedule_id,
            });

            return res.status(200).json({ message: 'Hoãn và tạo lịch bù thành công.', data: { original: schedule, makeup: makeupSchedule } });
        }

        res.status(400).json({ message: 'Yêu cầu không hợp lệ.' });
    } catch (error) {
        console.error('Lỗi khi cập nhật lịch học:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

module.exports = {
    assignTeacherToClassroom,
    createScheduleForClassroom,
    updateClassroomStatus,
    getClassroomsByTeacher,
    getAllAssignedClassrooms,
    getSchedulesByClassroom,
    postponeAndMakeupSchedule,
    updateTeacherAssignment
};
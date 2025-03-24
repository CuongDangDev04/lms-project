const { Classroom, Class, Course, ClassStatus, UserParticipation, Schedule, User, sequelize } = require('../../models/index');
const { Op } = require('sequelize');

const getCourses = async (req, res) => {
    try {
        const classrooms = await Classroom.findAll({
            include: [
                { model: Class, attributes: ['class_name'] },
                { model: Course, attributes: ['course_code', 'course_name', 'description'] },
                { model: ClassStatus, attributes: ['status_id', 'status_name'], },
                { model: Schedule, },
            ],
        });

        const classroomIds = classrooms.map((classroom) => classroom.classroom_id);

        const enrollmentCounts = await UserParticipation.findAll({
            attributes: [
                'classroom_id',
                [
                    sequelize.fn('COUNT', sequelize.col('User.user_id')),
                    'current_enrollment'
                ],
            ],
            include: [{
                model: User,
                attributes: [],
                where: { role_id: 1 },
            }],
            where: {
                classroom_id: { [Op.in]: classroomIds },
            },
            group: ['classroom_id'],
            raw: true,
        });

        const enrollmentMap = enrollmentCounts.reduce((map, item) => {
            map[item.classroom_id] = item.current_enrollment;
            return map;
        }, {});

        // Format dữ liệu trả về
        const formattedCourses = classrooms.map((classroom) => {
            const currentEnrollment = enrollmentMap[classroom.classroom_id] || 0;

            const classStatus = classroom.ClassStatus || { status_name: 'Không xác định' };

            return {
                classroom_id: classroom.classroom_id,
                course_id: classroom.course_id,
                class_name: classroom.Class.class_name,
                course_code: classroom.Course.course_code,
                course_name: classroom.Course.course_name,
                description: classroom.Course.description,
                start_date: classroom.start_date,
                end_date: classroom.end_date,
                max_capacity: classroom.max_capacity,
                current_enrollment: currentEnrollment,
                status: classStatus.status_name,
                schedules: classroom.Schedules ? classroom.Schedules.map((schedule) => ({
                    weekdays: schedule.weekdays,
                    event_type: schedule.event_type,
                    exam_date: schedule.exam_date,
                    is_postponed: schedule.is_postponed,
                    makeup_date: schedule.makeup_date,
                    parent_schedule_id: schedule.parent_schedule_id,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    date: schedule.date,
                })) : [],
            };
        });

        console.log(formattedCourses);
        res.json(formattedCourses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCoursesToAssigned = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const enrollments = await UserParticipation.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Classroom,
                    include: [
                        { model: Class, attributes: ['class_name'] },
                        { model: Course, attributes: ['course_code', 'course_name', 'description'] },
                        { model: ClassStatus, attributes: ['status_id', 'status_name'] },
                        { model: Schedule, },
                    ],
                },
            ],
        });

        const classroomIds = enrollments.map((enrollment) => enrollment.classroom_id);

        const enrollmentCounts = await UserParticipation.findAll({
            attributes: [
                'classroom_id',
                [
                    sequelize.fn('COUNT', sequelize.col('User.user_id')),
                    'current_enrollment'
                ],
            ],
            include: [{
                model: User,
                attributes: [],
                where: { role_id: 1 },
            }],
            where: {
                classroom_id: { [Op.in]: classroomIds },
            },
            group: ['classroom_id'],
            raw: true,
        });

        const enrollmentMap = enrollmentCounts.reduce((map, item) => {
            map[item.classroom_id] = item.current_enrollment;
            return map;
        }, {});

        // Format dữ liệu trả về
        const formattedEnrollments = enrollments.map((enrollment) => {
            const currentEnrollment = enrollmentMap[enrollment.classroom_id] || 0;

            const classStatus = enrollment.Classroom?.ClassStatus || { status_name: 'Không xác định' };

            return {
                classroom_id: enrollment.classroom_id,
                course_id: enrollment.Classroom.course_id,
                class_name: enrollment.Classroom.Class.class_name,
                course_code: enrollment.Classroom.Course.course_code,
                course_name: enrollment.Classroom.Course.course_name,
                description: enrollment.Classroom.Course.description,
                start_date: enrollment.Classroom.start_date,
                end_date: enrollment.Classroom.end_date,
                max_capacity: enrollment.Classroom.max_capacity,
                current_enrollment: currentEnrollment,
                status: classStatus.status_name,
                schedules: enrollment.Classroom?.Schedules ? enrollment.Classroom.Schedules.map((schedule) => ({
                    weekdays: schedule.weekdays,
                    event_type: schedule.event_type,
                    exam_date: schedule.exam_date,
                    is_postponed: schedule.is_postponed,
                    makeup_date: schedule.makeup_date,
                    parent_schedule_id: schedule.parent_schedule_id,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    date: schedule.date,
                })) : [],
            };
        });

        res.json(formattedEnrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignedCourse = async (req, res) => {
    try {
        const classroomId = req.params.classroomId;
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findByPk(userId);
        if (!user || user.role_id !== 1) {
            return res.status(403).json({ message: 'Chỉ sinh viên mới được đăng ký lớp' });
        }

        const classroom = await Classroom.findByPk(classroomId, {
            include: [
                { model: ClassStatus },
            ],
        });
        if (!classroom) return res.status(404).json({ message: 'Lớp không tồn tại' });
        if (classroom.status_id !== 2) {
            return res.status(400).json({ message: 'Lớp không ở trạng thái mở đăng ký' });
        }

        const currentEnrollment = await UserParticipation.count({
            where: { classroom_id: classroomId },
            include: [{
                model: User,
                attributes: [],
                where: { role_id: 1 },
            }],
        });

        if (currentEnrollment >= classroom.max_capacity) {
            return res.status(400).json({ message: 'Lớp đã đạt giới hạn số lượng sinh viên tối đa' });
        }

        const existingEnrollment = await UserParticipation.findOne({
            where: { user_id: userId, classroom_id: classroomId },
        });
        if (existingEnrollment) {
            return res.status(400).json({ message: 'Bạn đã đăng ký lớp này' });
        }

        await UserParticipation.create({
            user_id: userId,
            classroom_id: classroomId,
        });

        res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCoureToAssigned = async (req, res) => {
    try {
        const classroomId = req.params.classroomId;
        const userId = req.user.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const enrollment = await UserParticipation.findOne({
            where: { user_id: userId, classroom_id: classroomId },
        });
        if (!enrollment) {
            return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
        }

        await enrollment.destroy();
        res.status(200).json({ message: 'Hủy đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getCourses,
    getCoursesToAssigned,
    assignedCourse,
    deleteCoureToAssigned,


};
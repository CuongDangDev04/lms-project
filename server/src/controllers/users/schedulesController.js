// controllers/scheduleController.js
const { sequelize, User, Classroom, Schedule, Course, Class, UserParticipation } = require('../../models/index');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

const getSchedule = async (req, res) => {
    const userId = req.user.id; // Lấy userId từ token

    try {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Classroom,
                    as: 'Classrooms',
                    through: { attributes: [] },
                    include: [
                        {
                            model: Class,
                            attributes: ['class_name'],
                        },
                        {
                            model: Course,
                            attributes: ['course_name', 'course_code'],
                        },
                        {
                            model: Schedule,
                            as: 'Schedules',
                            attributes: [
                                'schedule_id',
                                'classroom_id',
                                'event_type',
                                'weekdays',
                                'start_time',
                                'end_time',
                                'description',
                                'exam_date',
                                'is_postponed',
                                'makeup_date',
                                'date',
                                'parent_schedule_id'
                            ],
                        },
                    ],
                },
            ],
        });

        if (!user || !user.Classrooms) {
            return res.status(404).json({ error: 'Không tìm thấy lịch học cho người dùng này' });
        }

        // Định dạng dữ liệu lịch học
        const formattedSchedules = user.Classrooms.reduce((acc, classroom) => {
            classroom.Schedules.forEach(schedule => {
                console.log('Raw schedule data:', {
                    schedule_id: schedule.schedule_id,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    date: schedule.date,
                });

                const scheduleDate = schedule.date && dayjs(schedule.date).isValid() ? dayjs(schedule.date) : dayjs();
                const dateStr = scheduleDate.format('YYYY-MM-DD');

                const startTimeStr = schedule.start_time || '00:00:00';
                const endTimeStr = schedule.end_time || '00:00:00';

                const fullStartDate = dayjs(`${dateStr} ${startTimeStr}`, 'YYYY-MM-DD HH:mm:ss');
                const fullEndDate = dayjs(`${dateStr} ${endTimeStr}`, 'YYYY-MM-DD HH:mm:ss');

                console.log('Full dates:', {
                    fullStartDate: fullStartDate.format(),
                    fullEndDate: fullEndDate.format(),
                });

                const dateKey = fullStartDate.isValid() ? fullStartDate.format('YYYY-MM-DD') : 'Invalid Date';
                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }

                acc[dateKey].push({
                    schedule_id: schedule.schedule_id,
                    classroom_id: schedule.classroom_id,
                    event_type: schedule.event_type,
                    weekdays: schedule.weekdays,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    description: schedule.description,
                    exam_date: schedule.exam_date ? dayjs(schedule.exam_date).format('YYYY-MM-DD') : null,
                    is_postponed: schedule.is_postponed,
                    makeup_date: schedule.makeup_date ? dayjs(schedule.makeup_date).format('YYYY-MM-DD') : null,
                    date: schedule.date,
                    parent_schedule_id: schedule.parent_schedule_id,
                    subject: classroom.Course.course_name || 'Chưa xác định',
                    class: `${classroom.Class.class_name || 'N/A'} - ${classroom.Course.course_code || 'N/A'}`,
                    time: fullStartDate.isValid() && fullEndDate.isValid()
                        ? `${fullStartDate.format('HH:mm')} - ${fullEndDate.format('HH:mm')}`
                        : 'Invalid Time',
                    teacher: 'Chưa xác định',
                    type: schedule.event_type || schedule.description || 'lecture',
                    session: fullStartDate.isValid() ? getSession(fullStartDate) : 'unknown',
                    classroom_id_ref: classroom.classroom_id, // Lưu tạm để debug
                });
            });

            return acc;
        }, {});

        // Lấy giảng viên cho từng Classroom
        for (const dateKey in formattedSchedules) {
            for (const schedule of formattedSchedules[dateKey]) {
                const classroomId = schedule.classroom_id_ref;
                const teacherParticipation = await UserParticipation.findOne({
                    where: {
                        classroom_id: classroomId,
                    },
                    include: [
                        {
                            model: User,
                            as: 'User',
                            where: { role_id: 2 },
                            attributes: ['fullname'],
                        },
                    ],
                });

                schedule.teacher = teacherParticipation && teacherParticipation.User
                    ? `GV: ${teacherParticipation.User.fullname}`
                    : 'Chưa xác định';
                delete schedule.classroom_id_ref;
            }
        }

        res.json(formattedSchedules);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Không thể lấy lịch học' });
    }
};

const getScheduleToday = async (req, res) => {
    const userId = req.user.id;
    const today = dayjs().format('YYYY-MM-DD');

    try {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Classroom,
                    as: 'Classrooms',
                    through: { attributes: [] },
                    include: [
                        {
                            model: Class,
                            attributes: ['class_name'],
                        },
                        {
                            model: Course,
                            attributes: ['course_name', 'course_code'],
                        },
                        {
                            model: Schedule,
                            as: 'Schedules',
                            attributes: [
                                'schedule_id',
                                'classroom_id',
                                'event_type',
                                'weekdays',
                                'start_time',
                                'end_time',
                                'description',
                                'exam_date',
                                'is_postponed',
                                'makeup_date',
                                'date',
                                'parent_schedule_id'
                            ],
                        },
                    ],
                },
            ],
        });

        if (!user || !user.Classrooms) {
            return res.status(404).json({ error: 'Không tìm thấy lịch học cho người dùng này' });
        }

        // Định dạng dữ liệu lịch học
        const formattedSchedules = user.Classrooms.reduce((acc, classroom) => {
            classroom.Schedules.forEach(schedule => {
                const scheduleDate = schedule.date && dayjs(schedule.date).isValid() ? dayjs(schedule.date) : null;
                if (!scheduleDate || scheduleDate.format('YYYY-MM-DD') !== today) {
                    return; // Chỉ lấy lịch của hôm nay
                }

                const dateStr = scheduleDate.format('YYYY-MM-DD');
                const startTimeStr = schedule.start_time || '00:00:00';
                const endTimeStr = schedule.end_time || '00:00:00';

                const fullStartDate = dayjs(`${dateStr} ${startTimeStr}`, 'YYYY-MM-DD HH:mm:ss');
                const fullEndDate = dayjs(`${dateStr} ${endTimeStr}`, 'YYYY-MM-DD HH:mm:ss');

                acc.push({
                    schedule_id: schedule.schedule_id,
                    classroom_id: schedule.classroom_id,
                    event_type: schedule.event_type,
                    weekdays: schedule.weekdays,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    description: schedule.description,
                    exam_date: schedule.exam_date ? dayjs(schedule.exam_date).format('YYYY-MM-DD') : null,
                    is_postponed: schedule.is_postponed,
                    makeup_date: schedule.makeup_date ? dayjs(schedule.makeup_date).format('YYYY-MM-DD') : null,
                    date: schedule.date,
                    parent_schedule_id: schedule.parent_schedule_id,
                    subject: classroom.Course.course_name || 'Chưa xác định',
                    class: `${classroom.Class.class_name || 'N/A'} - ${classroom.Course.course_code || 'N/A'}`,
                    time: fullStartDate.isValid() && fullEndDate.isValid()
                        ? `${fullStartDate.format('HH:mm')} - ${fullEndDate.format('HH:mm')}`
                        : 'Invalid Time',
                    teacher: 'Chưa xác định',
                    type: schedule.event_type || schedule.description || 'lecture',
                    session: fullStartDate.isValid() ? getSession(fullStartDate) : 'unknown',
                    classroom_id_ref: classroom.classroom_id,
                });
            });

            return acc;
        }, []);

        // Lấy giảng viên cho từng Classroom
        for (const schedule of formattedSchedules) {
            const classroomId = schedule.classroom_id_ref;
            const teacherParticipation = await UserParticipation.findOne({
                where: {
                    classroom_id: classroomId,
                },
                include: [
                    {
                        model: User,
                        as: 'User',
                        where: { role_id: 2 },
                        attributes: ['fullname'],
                    },
                ],
            });

            schedule.teacher = teacherParticipation && teacherParticipation.User
                ? `GV: ${teacherParticipation.User.fullname}`
                : 'Chưa xác định';
            delete schedule.classroom_id_ref;
        }

        res.json(formattedSchedules);
    } catch (error) {
        console.error('Error fetching schedule for today:', error);
        res.status(500).json({ error: 'Không thể lấy lịch học' });
    }
};

const getSession = (date) => {
    const hour = date.hour();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
};

module.exports = { getSchedule, getScheduleToday };
const express = require('express');
const { Course, Classroom, UserParticipation, User, sequelize } = require('../../models/index');
const { Parser } = require('json2csv');

const getDashboardStats = async (req, res) => {
    try {
        const totalCourses = await Course.count();
        const totalLecturers = await User.count({ where: { role_id: 2 } });
        const totalStudents = await User.count({ where: { role_id: 1 } });

        const stats = {
            totalCourses,
            totalLecturers,
            totalStudents
        };

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Không thể lấy dữ liệu thống kê',
            error: error.message
        });
    }
};

const getStats = async (req, res) => {
    try {
        const totalCourses = await Course.count();
        const totalLecturers = await User.count({ where: { role_id: 2 } });
        const totalStudents = await User.count({ where: { role_id: 1 } });

        const [courseStats] = await sequelize.query(`
            SELECT 
                c.course_id,
                c.course_name,
                COUNT(DISTINCT up.user_id) as registered_students
            FROM Courses c
            LEFT JOIN Classrooms cr ON c.course_id = cr.course_id
            LEFT JOIN User_participations up ON cr.classroom_id = up.classroom_id
            GROUP BY c.course_id, c.course_name
            ORDER BY registered_students DESC
        `);

        const [classroomStats] = await sequelize.query(`
            SELECT 
                c.course_id,
                c.course_name,
                COUNT(cr.classroom_id) as classroom_count
            FROM Courses c
            LEFT JOIN Classrooms cr ON c.course_id = cr.course_id
            GROUP BY c.course_id, c.course_name
            ORDER BY classroom_count DESC
            LIMIT 5
        `);

        const stats = {
            totalCourses,
            totalLecturers,
            totalStudents,
            courseRegistrationStats: courseStats,
            classroomStats
        };

        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching detailed stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Không thể lấy dữ liệu thống kê chi tiết',
            error: error.message
        });
    }
};

const exportStats = async (req, res) => {
    try {
        const totalCourses = await Course.count();
        const totalLecturers = await User.count({ where: { role_id: 2 } });
        const totalStudents = await User.count({ where: { role_id: 1 } });

        const [courseStats] = await sequelize.query(`
            SELECT 
                c.course_id,
                c.course_name,
                COUNT(DISTINCT up.user_id) as registered_students
            FROM Courses c
            LEFT JOIN Classrooms cr ON c.course_id = cr.course_id
            LEFT JOIN User_participations up ON cr.classroom_id = up.classroom_id
            GROUP BY c.course_id, c.course_name
            ORDER BY registered_students DESC
        `);

        const [classroomStats] = await sequelize.query(`
            SELECT 
                c.course_id,
                c.course_name,
                COUNT(cr.classroom_id) as classroom_count
            FROM Courses c
            LEFT JOIN Classrooms cr ON c.course_id = cr.course_id
            GROUP BY c.course_id, c.course_name
            ORDER BY classroom_count DESC
        `);

        const fields = [
            { label: 'Course ID', value: 'course_id' },
            { label: 'Course Name', value: 'course_name' },
            { label: 'Registered Students', value: 'registered_students' }
        ];
        const classroomFields = [
            { label: 'Course ID', value: 'course_id' },
            { label: 'Course Name', value: 'course_name' },
            { label: 'Classroom Count', value: 'classroom_count' }
        ];

        const json2csvParser = new Parser({ fields });
        const classroomCsvParser = new Parser({ fields: classroomFields });
        const courseCsv = json2csvParser.parse(courseStats);
        const classroomCsv = classroomCsvParser.parse(classroomStats);

        const summary = `Total Courses: ${totalCourses}, Total Lecturers: ${totalLecturers}, Total Students: ${totalStudents}\n`;
        const fullCsv = `${summary}\nCourse Registration Stats:\n${courseCsv}\n\nClassroom Stats:\n${classroomCsv}`;

        res.header('Content-Type', 'text/csv');
        res.attachment('dashboard_stats_report.csv');
        res.send(fullCsv);
    } catch (error) {
        console.error('Error exporting stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Không thể xuất báo cáo',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getStats,
    exportStats
};
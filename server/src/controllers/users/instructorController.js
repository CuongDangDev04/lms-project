// Trong file controller (ví dụ: classroomController.js)
const { User, Classroom, Course, UserParticipation, Class } = require('../../models/index'); // Điều chỉnh đường dẫn tới models của bạn

// 1. Lấy danh sách các khóa học mà giảng viên giảng dạy
exports.getCoursesByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const teacherParticipations = await UserParticipation.findAll({
      where: { user_id: teacherId },
      include: [
        {
          model: User,
          where: { role_id: 2 },  
          attributes: ['user_id', 'username', 'fullname'],
        },
        {
          model: Classroom,
          include: [
            {
              model: Course,
              attributes: ['course_id', 'course_name', 'course_code', 'description'],
            },
            {
              model: Class,
              attributes:['class_id','class_name']
            }
          ],
          attributes: ['start_date', 'end_date', 'classroom_id'],  
        },
        
      ],
    });

    if (!teacherParticipations.length) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học nào của giảng viên này' });
    }

    // Format dữ liệu trả về
    const courses = teacherParticipations.map(part => ({
      course_id: part.Classroom.Course.course_id,
      course_name: part.Classroom.Course.course_name,
      course_code: part.Classroom.Course.course_code,
      classroom_id: part.Classroom.classroom_id, 
      description: part.Classroom.Course.description,
      start_date: part.Classroom.start_date,
      end_date: part.Classroom.end_date,
      class_id: part.Classroom.Class.class_id,
      class_name: part.Classroom.Class.class_name
    }));

    res.status(200).json({ success: true, message: 'Lấy danh sách khóa học thành công', data: courses });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khóa học:', error);
    res.status(500).json({ success: false, message: 'Đã xảy ra lỗi server', error: error.message });
  }
};
// 2. Lấy danh sách sinh viên trong một khóa học cụ thể của giảng viên
exports.getStudentsByTeacherAndCourse = async (req, res) => {
  try {
    const { teacherId, courseId } = req.params;

    // Kiểm tra xem giảng viên có tham gia khóa học này không
    const teacherParticipations = await UserParticipation.findAll({
      where: {
        user_id: teacherId,
      },
      include: [
        {
          model: User,
          where: {
            role_id: 2,  
          },
          attributes: ['user_id', 'username', 'fullname', 'email'],
        },
        {
          model: Classroom,
          include: [
            {
              model: Course,
              where: {
                course_id: courseId,  
              },
              attributes: ['course_id', 'course_name', 'course_code'],
            },
          ],
        },
      ],
    });

    if (!teacherParticipations.length) {
      return res.status(404).json({
        success: false,
        message: 'Giảng viên không dạy khóa học này hoặc khóa học không tồn tại',
      });
    }

    // Lấy tất cả classroom_id liên quan đến khóa học này
    const classroomIds = teacherParticipations.map(part => part.classroom_id);

    // Tìm tất cả sinh viên trong các lớp thuộc khóa học đó
    const studentParticipations = await UserParticipation.findAll({
      where: {
        classroom_id: classroomIds,
      },
      include: [
        {
          model: User,
          where: {
            role_id: 1, // Chỉ lấy sinh viên
          },
          attributes: ['user_id', 'username', 'fullname', 'email'],
        },
        {
          model: Classroom,
          include: [
            {
              model: Course,
              attributes: ['course_id', 'course_name', 'course_code'],
            },
          ],
        },
      ],
    });

    // Format dữ liệu trả về
    const result = studentParticipations.map(participation => ({
      student: {
        user_id: participation.User.user_id,
        username: participation.User.username,
        fullname: participation.User.fullname,
        email: participation.User.email,
      },
      course: {
        course_id: participation.Classroom.Course.course_id,
        course_name: participation.Classroom.Course.course_name,
        course_code: participation.Classroom.Course.course_code,
      },
      classroom_id: participation.classroom_id,
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sinh viên thành công',
      data: result,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sinh viên:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi server',
      error: error.message,
    });
  }
};

// Route mẫu (trong file routes)
// const router = require('express').Router();
// router.get('/courses-by-teacher/:teacherId', classroomController.getCoursesByTeacher);
// router.get('/students-by-teacher/:teacherId/:courseId', classroomController.getStudentsByTeacherAndCourse);
// module.exports = router;
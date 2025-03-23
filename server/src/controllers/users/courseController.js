const {
  Course,
  Classroom,
  UserParticipation,
  Class,
  ClassStatus,
  User
} = require("../../models/index");

const fetch_specific_course_information = async (req, res) => {
  let course_id = req.params.course_id;
  try {
    const course = await Course.findOne({
      where: { course_id },
      include: [
        {
          model: Classroom,
          attributes: ["classroom_id", "start_date", "end_date"],
        },
      ],
    });
    res.status(200).json({
      success: true,
      message: "Lay khoa hoc thanh công!",
      data: course,
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch {
    console.error("Error fetching course schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const fetch_list_courses = async (req, res) => {
  try {
    const course = await Classroom.findAll({
      include: [
        {
          model: Course,
        },
      ],
    });
    console.log(course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({
      success: true,
      message: "Lay khoa hoc thanh công!",
      data: course,
    });
  } catch {
    console.error("Error fetching course schedule:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const fetchStudentCourses = async (req, res) => {
  const user_id = req.user.id;
  try {
    const userCourse = await UserParticipation.findAll({
      where: { user_id },
      include: [
        {
          model: User,
          attributes: ["username", "email"]
        },
        {
          model: Classroom,
          attributes: [ "classroom_id", "start_date", "end_date"],
          include: [
            {
              model: Course,
              attributes: ["course_name", "course_code", "course_id","description"]
            },
            {
              model: Class,
              attributes: ["class_id", "class_name"]
            },
            { 
              model: ClassStatus, 
              as: "ClassStatus",
              attributes: ["status_name"] 
            },
          ],
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      message: "lấy khóa học của user thành công ",
      data: userCourse,
    });
  } catch (err) {
    console.error("Error fetching student courses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const fetchTeacherInformation = async (req, res) => {
    const classroom_id = req.params.classroom_id; 
    try {
        const teacher = await Classroom.findOne({
            where: { classroom_id },
            include: [
              {
                model: Class,
                attributes: ["class_name"],
              },
                {
                    model: User,
                    where: { role_id: 2 },
                    attributes: ["username", "email"]
                }
            ]
        });
        res.status(200).json({
            success: true,
            message: "Lấy thông tin giáo viên thành công!",
            data: teacher,
        });
    } catch (error) {
        console.error("Error fetching teacher information:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
  fetch_specific_course_information,
  fetch_list_courses,
  fetchStudentCourses,
  fetchTeacherInformation
};

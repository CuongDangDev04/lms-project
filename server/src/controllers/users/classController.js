const { google } = require("googleapis");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_HOST = process.env.DAILY_API_HOST;
const {
  User,
  Course,
  Class,
  Role,
  Classroom,
  UserParticipation,
} = require("../../models");

// Lấy danh sách sinh viên trong một lớp của một khóa học
const getStudentsInClassCourse = async (req, res) => {
  try {
    const { classroomId } = req.params;

    const classroom = await Classroom.findByPk(classroomId);

    if (!classroom) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lớp học này trong khóa học" });
    }

    const students = await User.findAll({
      include: [
        {
          model: Classroom,
          through: UserParticipation,
          where: { classroom_id: classroom.classroom_id },
        },
      ],
      attributes: ["username", "fullname", "avt"],
    });

    res.status(200).json({ students });
  } catch (error) {
    console.error("Lỗi lấy danh sách sinh viên:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

//Lấy thông tin lớp học của một khóa học

const getClassInCourse = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const classCourse = await Classroom.findByPk(classroomId);
    if (!classCourse) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lớp học này trong khóa học" });
    }
    const classInfo = await Classroom.findOne({
      where: { classroom_id: classroomId },
      include: [
        {
          model: Class,
        },
        {
          model: Course,
        },
      ],
      raw: true,
      nest: true,
    });
    res.status(200).json({ classInfo });
  } catch (error) {
    console.error("Lỗi lấy thông tin lớp học:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

const getUserClassCourse = async (req, res) => {
  try {
    const { userId } = req.params;
    const isUserCourse = await UserParticipation.findOne({
      where: { user_id: userId },
    });
    if (!isUserCourse) {
      return res.status(404).json({ message: "User chưa có khóa học nào" });
    }

    const classCourseOfUser = await User.findOne({
      where: { user_id: userId }, // Tìm user có user_id tương ứng
      attributes: ["username"],
      include: [
        {
          model: Classroom,
          through: { model: UserParticipation, where: { user_id: userId } }, // Lọc theo UserParticipation
          include: [
            {
              model: Class,
              attributes: ["class_id", "class_name"], // Chỉ lấy thông tin cần thiết
            },
            {
              model: Course,
              attributes: ["course_id", "course_name"],
            },
          ],
        },
      ],
    });
    res.status(200).json({ classCourseOfUser });
  } catch (error) {
    console.error("Lỗi lấy thông tin lớp học:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
const createRoomOnline = async (req, res) => {
  try {
    const { classroomId } = req.params;
    if (!classroomId) {
      return res.status(400).json({ message: "Thiếu classroomID" });
    }
    const classroom = await Classroom.findByPk(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Không tìm thấy lớp học này" });
    }
    if (classroom.room_url) {
      try {
        const roomName = classroom.room_url.split("/").pop();
        const roomURL = await axios.get(`${DAILY_API_HOST}/${roomName}`, {
          headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
          },
        });
        if (!roomURL) {
          return res.status(400).json({ message: "Không có room trên cloud" });
        }
        return res.status(200).json({ roomUrl: roomURL.data.url });
      } catch (error) {
        console.warn("Phòng trên Daily.co không tồn tại, tạo phòng mới...");
      }
    }
    const response = await axios.post(
      `${DAILY_API_HOST}`,
      {
        name: `classroom_${classroomId}`,
        properties: { enable_chat: true, enable_screenshare: true },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
      }
    );
    classroom.room_url = response.data.url;
    await classroom.save();
    res.status(200).json({ roomUrl: response.data.url });
  } catch (error) {
    console.error("Lỗi khi tạo phòng:", error);
  }
};

const getClassroomOfCourse = async (req, res) => {
  try {
    const { courseId } = req.query;

    const classrooms = await Classroom.findAll({
      where: { course_id: courseId },
    });

    res.status(200).json({ classrooms });
  } catch (error) {
    console.error("Lỗi lấy danh sách lớp học:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};

module.exports = {
  getStudentsInClassCourse,
  getClassInCourse,
  getUserClassCourse,
  createRoomOnline,
  getClassroomOfCourse,
};

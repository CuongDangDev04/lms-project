import api from "./api";

const API_BASE_URL = "/api/class-course";

const ClassService = {
  // Lấy thông tin lớp của một khóa học
  getClassInfo: async (classroomId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/${classroomId}/class`);
      return response.data; // Trả về dữ liệu lớp học
    } catch (error) {
      console.error("Lỗi lấy thông tin lớp:", error);
      throw error; // Ném lỗi để xử lý phía UI
    }
  },
  getAllClassOfUser: async (userId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/user/${userId}`);
      return response.data; // Trả về dữ liệu lớp học của user
    } catch (error) {
      console.error("Lỗi lấy thông tin lớp học của user:", error);
      throw error; // Ném lỗi để xử lý phía UI
    }
  },
  getAllUserInClass: (classroomId) =>
    api.get(`${API_BASE_URL}/${classroomId}/users`),
  getClassOfCourse: async (courseId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/getClassOfCourse`, {
        params: { courseId },
      });
      console.log("Response from getClassOfCourse:", response.data);
      return response.data; // Trả về dữ liệu thực tế
    } catch (error) {
      console.error("Lỗi khi gọi getClassOfCourse:", error);
      throw error; // Ném lỗi để xử lý ở nơi gọi
    }
  },
};

export default ClassService;

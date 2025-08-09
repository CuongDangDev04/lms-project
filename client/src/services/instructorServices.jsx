// api/instructorService.js
import api from "./api"; // Giả sử đây là instance axios đã được config

const API_URL = "/api/instructor";

export const getStudentByInstructor = async (teacherId) => {
  try {
    const response = await api.get(`${API_URL}/students-by-teacher/${teacherId}`);
    return response.data; // Trả về dữ liệu từ API
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sinh viên:", error);
    throw error; // Ném lỗi để xử lý ở nơi gọi
  }
};
// Lấy danh sách các khóa học của giảng viên
export const getCoursesByInstructor = async (teacherId) => {
    try {
      const response = await api.get(`${API_URL}/courses-by-teacher/${teacherId}`);
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa học:", error);
      throw error; // Ném lỗi để xử lý ở nơi gọi
    }
  };
  
  // Lấy danh sách sinh viên trong một khóa học cụ thể của giảng viên
  export const getStudentsByInstructorAndCourse = async (teacherId, courseId) => {
    try {
      const response = await api.get(`${API_URL}/students-by-teacher/${teacherId}/${courseId}`);
      return response.data; // Trả về dữ liệu từ API
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên trong khóa học:", error);
      throw error; // Ném lỗi để xử lý ở nơi gọi
    }
  };
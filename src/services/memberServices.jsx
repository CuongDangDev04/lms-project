import api from "./api";


const API_URL = "/api";




export const fetchMemberOnClassroom = async (classroomId) => {
  try {
    const response = await api.get(`${API_URL}/members/${classroomId}`);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    throw error;
  }
};

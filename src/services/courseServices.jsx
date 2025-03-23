import api from "./api";
const API_URL = "/api/admin";

const FETCH_LIST_COURSES = "/api";

export const getCourseById = async (id) => {  
  try {
    const response = await api.get(`/api/admin/courses/${id}`);  
    return response.data.data;    
  } catch (error) {   
    console.error(`Lỗi khi lấy khóa học ID ${id}:`, error);   
    throw error;
  } 
};

export const fetchTeacherInformation = async (classroomId) => {
  try {
    const response = await api.get(
      `${FETCH_LIST_COURSES}/courses/teacherInformation/${classroomId}`
    );
    return response.data.data;
    
  } catch (error) {
    console.error("Lỗi khi lấy thông tin giảng viên:", error);
    throw error;
  }
};


export const fetch_sepecify_course = async (course_id, classroom_id) => {
  try {
    const response = await api.get(
      `${FETCH_LIST_COURSES}/courses/courseSchedule/:course_id/classroom_id`
    );
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    throw error;
  }
};
export const fetch_list_courses = async () => {
  try {
    const response = await api.get(`${FETCH_LIST_COURSES}/courses`);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    throw error;
  }
};
export const fetchStudentCourses = async () => {
  try {
    const response = await api.get(
      `${FETCH_LIST_COURSES}/courses/studentCourse`
    );
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    throw error;
  }
};

export const getCourses = async () => {
  try {
    const response = await api.get(`${API_URL}/courses`);
    return response.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    throw error;
  }
};
export const createCourse = async (courseData) => {
  try {
    const response = await api.post(`${API_URL}/courses/create`, courseData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo khóa học:", error);
    throw error;
  }
};

export const createCourseByExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // "file" phải khớp với multer.single("file") ở backend
    const response = await api.post(
      `${API_URL}/courses/createByExcel`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi upload file Excel:", error);
    throw error;
  }
};

export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`${API_URL}/courses/${id}`, courseData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật khóa học ID ${id}:`, error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa khóa học ID ${id}:`, error);
    throw error;
  }
};

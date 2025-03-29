import api from "./api"; // Giả định bạn đã export axios instance với tên 'api' từ api.js

const URL_API = "/api/quiz";

// 1. Tạo bài thi
export const createExam = async (examData) => {
  try {
    const response = await api.post(`${URL_API}/exams`, examData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo bài thi:", error);
    throw error;
  }
};

// 2. Tạo bài thi từ file Word
export const createExamFromWord = async (formData) => {
  try {
    const response = await api.post(`${URL_API}/exams/uploadword`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo bài thi từ file Word:", error);
    throw error;
  }
};

// 2. Lấy danh sách bài thi theo lớp học
export const getExamsByClassroom = async (classroomId) => {
  try {
    const response = await api.get(`${URL_API}/exams/classrooms/${classroomId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài thi:", error);
    throw error;
  }
};

// 3. Lấy chi tiết bài thi
export const getExamDetails = async (examId) => {
  try {
    const response = await api.get(`${URL_API}/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài thi:", error);
    throw error;
  }
};

// 4. Nộp bài thi
export const submitExam = async (examId, userId, answers) => {
  const data = {
    exam_id: examId,
    user_id: userId,
    answers, // { [question_id]: selected_option_id }
  };

  try {
    const response = await api.post(`${URL_API}/exams/submit`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi nộp bài thi:", error);
    throw error;
  }
};

// 5. Xem kết quả bài thi cá nhân
export const getResult = async (examId) => {
  try {
    const response = await api.get(`${URL_API}/exams/result/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xem kết quả bài thi:", error);
    throw error;
  }
};

// 6. Xem tất cả kết quả của bài thi
export const getExamResults = async (examId) => {
  try {
    const response = await api.get(`${URL_API}/exams/results/${examId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xem tất cả kết quả bài thi:", error);
    throw error;
  }
};

// 7. Lấy danh sách lớp học
export const getAllClassrooms = async () => {
  try {
    const response = await api.get(`${URL_API}/all-classrooms`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lớp học:", error);
    throw error;
  }
};
// 8. Lấy danh sách bài thi theo lớp học (không bao gồm câu hỏi)
export const getExamsByClassroomSimple = async (classroomId) => {
  try {
    const response = await api.get(`${URL_API}/listexams/classroom/${classroomId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài thi đơn giản:", error);
    throw error;
  }
};

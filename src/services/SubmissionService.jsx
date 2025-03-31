import api from "./api";

const URL_API = "/api/submission";

// Nộp bài tập
export const submitAssignment = async (assignmentId, userId, files) => {
  const formData = new FormData();
  formData.append("assignment_id", assignmentId);
  formData.append("user_id", userId);
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await api.post(`${URL_API}/submit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi nộp bài tập:", error);
    throw error;
  }
};

// Lấy danh sách bài nộp theo assignment_id
export const getSubmissionsByAssignment = async (assignmentId) => {
  try {
    const response = await api.get(`${URL_API}/assignment/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài nộp:", error);
    throw error;
  }
};

// Tải file bài nộp
export const downloadSubmissionFiles = async (submissionId, fileIndex = null) => {
  try {
    const url = fileIndex !== null
      ? `${URL_API}/download/${submissionId}?fileIndex=${fileIndex}`
      : `${URL_API}/download/${submissionId}`;
    const response = await api.get(url);
    
    // Backend trả về signed URL và tên file
    const { fileUrl, filename } = response.data;

    // Tạo link tải
    const link = document.createElement("a");
    link.href = fileUrl;
    link.setAttribute("download", filename || `submission_${submissionId}_file_${fileIndex || 0}`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { fileUrl, filename };
  } catch (error) {
    console.error("Lỗi khi tải file bài nộp:", error);
    throw error;
  }
};

// Chấm điểm bài nộp
export const gradeSubmission = async (submissionId, score, feedback) => {
  const data = {
    submission_id: submissionId,
    score,
    feedback: feedback || "", // Đảm bảo feedback không undefined
  };

  try {
    const response = await api.post(`${URL_API}/grade`, data);
    console.log("Dữ liệu từ /api/submission/grade:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chấm điểm bài nộp:", error);
    throw error;
  }
};

// Xóa bài nộp
export const deleteSubmission = async (submissionId) => {
  try {
    const response = await api.delete(`${URL_API}/delete/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bài nộp:", error);
    throw error;
  }
};
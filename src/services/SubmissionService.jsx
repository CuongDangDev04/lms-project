import api from "./api"; // Giả định bạn export axios instance với tên 'api' từ api.jsx

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
    console.log("Dữ liệu từ /api/submissions/submit:", response.data);
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
    console.log(`Dữ liệu từ /api/submissions/assignment/${assignmentId}:`, response.data);
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
    const response = await api.get(url, {
      responseType: "blob",
    });
    const blob = new Blob([response.data]);
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;

    // Lấy tên file từ header Content-Disposition
    let filename;
    const contentDisposition = response.headers["content-disposition"];
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match && match[1]) {
        filename = match[1]; // Tên file gốc từ backend
      }
    }
    // Fallback nếu không có header
    if (!filename) {
      filename = fileIndex !== null
        ? `submission_${submissionId}_file_${fileIndex}`
        : `submission_${submissionId}.zip`;
    }

    console.log(`Tên file tải về: ${filename}`);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(urlBlob);

    return { message: "Tải file thành công!", filename };
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
    feedback,
  };

  try {
    const response = await api.post(`${URL_API}/grade`, data);
    console.log("Dữ liệu từ /api/submissions/grade:", response.data);
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
    console.log(`Dữ liệu từ /api/submissions/${submissionId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bài nộp:", error);
    throw error;
  }
};
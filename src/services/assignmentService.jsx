// src/services/assignmentService.js
import api from "./api";

const URL_API = "/api/assignments";

// Lấy danh sách bài tập
export const getAssignments = async () => {
  try {
    const response = await api.get(`${URL_API}/all`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài tập:", error);
    throw error;
  }
};

// Tải file bài tập
export const downloadAssignment = async (assignmentId, fileIndex = null) => {
  try {
    const response = await api.get(`${URL_API}/download/${assignmentId}${fileIndex !== null ? `?fileIndex=${fileIndex}` : ""}`, {
      responseType: "blob",
    });

    const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
    const contentDisposition = response.headers["content-disposition"];
    let filename = `assignment_${assignmentId}${fileIndex !== null ? `_${fileIndex}` : ""}.file`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    return { fileUrl, filename };
  } catch (error) {
    console.error("Lỗi khi tải file:", error);
    throw error;
  }
};
// Lấy danh sách bài tập theo lớp
export const getAssignmentsByClassRoom = async (classRoomId) => {
  try {
    const response = await api.get(`${URL_API}/classroom/${classRoomId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy bài tập theo lớp:", error);
    throw error;
  }
};

// Tải bài tập lên
export const uploadAssignment = async (userParticipationId, userId, files, title, description, startDate, endDate) => {
  try {
    const formData = new FormData();
    formData.append("user_participation_id", userParticipationId);
    formData.append("user_id", userId);
    formData.append("title", title);
    formData.append("description", description || ""); // Gửi rỗng nếu không có
    formData.append("start_assignment", startDate || ""); // Gửi rỗng nếu không có
    formData.append("end_assignment", endDate || ""); // Gửi rỗng nếu không có
    files.forEach((file) => formData.append("files", file)); // Gửi mảng file

    const response = await api.post(`${URL_API}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải bài tập lên:", error);
    throw error;
  }
};

// Lấy user_participation_id dựa trên user_id và classroom_id
export const getUserParticipationId = async (userId, classroomId) => {
  try {
    const response = await api.get(`/api/assignments/user-participation/${userId}/${classroomId}`);
    return response.data.user_participation_id;

  } catch (error) {
    console.error("Lỗi khi lấy user_participation_id:", error);
    throw error;
  }
};
export const updateAssignment = async (assignmentId, data, files, removeFileIndices = []) => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("start_assignment", data.startDate || "");
    formData.append("end_assignment", data.endDate || "");
    formData.append("removeFileIndices", JSON.stringify(removeFileIndices)); // Gửi mảng chỉ số file cần xóa

    if (files && files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }

    const response = await api.put(`${URL_API}/${assignmentId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật bài tập:", error);
    throw error;
  }
};
// Hàm xóa bài tập
export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await api.delete(`${URL_API}/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa bài tập:", error);
    throw error;
  }
};



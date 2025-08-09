import api from "./api";

const API_URL = "/api/chat";

// Lấy danh sách tin nhắn cũ
export const fetchMessages = async (classroomId) => {
  try {
    const response = await api.get(`${API_URL}/${classroomId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi tải tin nhắn:", error);
    throw error;
  }
};

// Gửi tin nhắn mới
export const sendMessage = async (messageData) => {
  try {
    await api.post(`${API_URL}/send`, messageData);
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    throw error;
  }
};

// Xóa tin nhắn
export const deleteMessage = async (messageId, userId) => {
  try {
    await api.delete(`${API_URL}/delete/${messageId}`, {
      data: { userId },
    });
  } catch (error) {
    console.error("Lỗi thu hồi tin nhắn:", error);
    throw error;
  }
};

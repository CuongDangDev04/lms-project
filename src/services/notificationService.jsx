import api from "./api";

const API_URL = "/api/notification";
const NotificationService = {
  //gửi tb có tất cả user
  sendNotification: async (notificationData) => {
    return api.post(`${API_URL}/sendNo`, notificationData);
  },
  //gửi tb cho gv
  sendNotificationToClassroomTeachers: async (notificationData) => {
    return api.post(`${API_URL}/sendNoToTeacher`, notificationData);
  },
  // Gửi thông báo cho tất cả user trong một khóa học
  sendNotificationToCourseUsers: async (notificationData) => {
    return api.post(`${API_URL}/sendNoToClassRoom`, notificationData);
  },

  // Gửi thông báo cho một user_id cụ thể
  sendNotificationToSpecificUser: async (notificationData) => {
    return api.post(`${API_URL}/sendNoToUser`, notificationData);
  },

  getNotifications: async (user) => {
    return api.get(`${API_URL}/getNo`, {
      headers: { user: JSON.stringify(user) },
    });
  },

  sendTagNotification: async (notificationData) => {
    return api.post(`${API_URL}/sendTagNotification`, notificationData);
  },

  markAsRead: async (notificationId, userId) => {
    return api.put(`${API_URL}/markAsRead`, { notificationId, userId });
  },
  markAllAsRead: async (userId) => {
    return api.put(`${API_URL}/markAllAsRead`, { userId });
  },

  deleteNotification: async (notificationId, userId) => {
    return api.delete(`${API_URL}/deleteNo`, {
      params: { notificationId, userId },
    });
  },

  deleteAllNotifications: async (userId) => {
    return api.delete(`${API_URL}/deleteAllNo`, {
      params: { userId },
    });
  },
};

export default NotificationService;

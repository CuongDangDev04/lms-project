import api from "./api";

const API_BASE_URL = "/api/coursesAssigned";

const AssignedClassService = {
    getAvailableClasses: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}`);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách lớp học:", error);
            throw error;
        }
    },

    getRegisteredClasses: async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/users/self/enrollments`);

            return response.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách lớp học đã đăng ký:", error);
            throw error;
        }
    },

    registerClass: async (classroomId) => {
        try {
            const response = await api.post(`${API_BASE_URL}/register/${classroomId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi đăng ký lớp học:", error);
            throw error;
        }
    },

    unregisterClass: async (classroomId) => {
        try {
            const response = await api.delete(`${API_BASE_URL}/unregister/${classroomId}`);
            return response.data;
        } catch (error) {
            console.error("Lỗi hủy đăng ký lớp học:", error);
            throw error;
        }
    },
};

export default AssignedClassService;
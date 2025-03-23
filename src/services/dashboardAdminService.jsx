// services/dashboardAdminService.js
import api from './api';

const API_URL = '/api/admin/dashboard-stats';

export const getDashboardStats = async () => {
    try {
        const response = await api.get(`${API_URL}`);
        return response.data.data; // Assuming structured response with 'data' field
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê dashboard:", error);
        throw error;
    }
};

export const fetchCourseList = async () => {    
    try {
        const response = await api.get(`${API_URL}/stats`);
        return response.data.data; // Assuming structured response with 'data' field
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học:", error);
        throw error;
    }
};

export const exportDashboardStats = async () => {
    try {
        const response = await api.get(`${API_URL}/export`, {
            responseType: 'blob' // Important for file downloads
        });
        return response.data; // Returns a Blob for the CSV file
    } catch (error) {
        console.error("Lỗi khi xuất báo cáo:", error);
        throw error;
    }
};
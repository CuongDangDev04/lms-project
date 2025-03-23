import api from "./api";
const API_URL = "/api";

export const getSchedule = async (token) => {
    try {
        const response = await api.get(`${API_URL}/schedule`)
        return response.data;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
    }
};

export const getScheduleToday = async () => {
    try {
        const response = await api.get(`${API_URL}/schedule/today`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy lịch học hôm nay:", error);
        throw error;
    }
};
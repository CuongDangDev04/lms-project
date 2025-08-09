import api from './api';

const API_URL = '/api/grade';

export const getClassGrades = async (classroomId) => {
    try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error("Không tìm thấy token");
        }

        const response = await api.get(`${API_URL}/${classroomId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách điểm:", error);
        throw error;
    }
};


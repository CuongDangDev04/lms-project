import api from "./api";
const API_URL = "/api/admin";

export const getClasses = async () => {
    try {
        const response = await api.get(`${API_URL}/classes`);
        return response.data.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
        throw error;
    }
};

export const createClass = async (classData) => {
    try {
        const response = await api.post(`${API_URL}/classes/create`, classData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo lớp học:", error);
        throw error;
    }
};

export const createClassByExcel = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file); // "file" phải khớp với multer.single("file") ở backend
        const response = await api.post(`${API_URL}/classes/createByExcel`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi upload file Excel:", error);
        throw error;
    }
};

export const updateClass = async (id, classData) => {
    try {
        const response = await api.put(`${API_URL}/classes/${id}`, classData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật lớp học ID ${id}:`, error);
        throw error;
    }
};

export const deleteClass = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/classes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa lớp học ID ${id}:`, error);
        throw error;
    }
};
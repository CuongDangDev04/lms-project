import api from "./api";
const API_URL = "/api/admin";




export const getUsers = async () => {
    try {
        const response = await api.get(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        throw error;
    }
};


export const getUserById = async (id) => {
    try {
        const response = await api.get(`${API_URL}/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy user ID ${id}:`, error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post(`${API_URL}/users/create`, userData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo user:", error);
        throw error;
    }
};

export const updateUser = async (id, userData) => {
    try {
        const response = await api.put(`${API_URL}/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật user ID ${id}:`, error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa user ID ${id}:`, error);
        throw error;
    }
};
export const getStudents = async () => {
    try {
        const response = await api.get(`${API_URL}/users/students`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên:", error);
        throw error;
    }
};
export const getInstructors = async () => {
    try {
        const response = await api.get(`${API_URL}/users/instructors`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giảng viên:", error);
        throw error;
    }
}
export const createInstructor = async (instructorData) => {
    try {
        const response = await api.post(`${API_URL}/users/create-instructor`, instructorData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo instructor:", error);
        throw error;
    }
};

export const getEduAffairs = async () => {
    try {
        const response = await api.get(`${API_URL}/users/eduAffairs`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giao vu:", error);
        throw error;
    }
}


export const createEduAffairs = async (EduAffairsData) => {
    try {
        const response = await api.post(`${API_URL}/users/eduAffairs`, EduAffairsData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo giao vu:", error);
        throw error;
    }
};


// Thêm hàm upload file Excel
export const uploadStudents = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file); // "file" phải khớp với multer.single("file") ở backend
        const response = await api.post(`${API_URL}/users/upload`, formData, {
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


// Thêm hàm upload giảng viên
export const uploadInstructors = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file); // "file" khớp với multer.single("file")
        const response = await api.post(`${API_URL}/users/uploadgv`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi upload file Excel cho giảng viên:", error);
        throw error;
    }
};

// Thêm hàm upload giảng viên
export const uploadEduAffairs = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file); // "file" khớp với multer.single("file")
        const response = await api.post(`${API_URL}/users/upload-giaovu`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi upload file Excel cho giảng viên:", error);
        throw error;
    }
};

export const upload = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file); // "file" khớp với multer.single("file")
        const response = await api.post(`${API_URL}/users/uploadgv`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi upload file Excel cho giảng viên:", error);
        throw error;
    }
};

export const getProfile = async () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const id_user = user.id;
    try {
        const response = await api.get(`${API_URL}/users/${id_user}`);
        return response.data;
    }
    catch (error) {
        console.error("Lỗi khi lấy thông tin user", error);
        throw error;
    }
}
export const uploadImage = async (file) => {
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
            throw new Error("User not found in localStorage");
        }
        const userId = user.id;

        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post(`${API_URL}/users/${userId}/uploadimg`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Lỗi khi upload ảnh avatar:", error);
        throw error;
    }
};
import api from "./api";
const API_URL = "/api/admin";

// Quản lý học phần
export const getClassrooms = async () => {
    try {
        const response = await api.get(`${API_URL}/classrooms`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
        throw error;
    }
};

export const addClassroom = async (classroomData) => {
    try {
        const response = await api.post(`${API_URL}/classrooms`, classroomData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo lớp học:", error);
        throw error;
    }
};

export const updateClassroom = async (id, classroomData) => {
    try {
        const response = await api.put(`${API_URL}/classrooms/${id}`, classroomData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật lớp học ID ${id}:`, error);
        throw error;
    }
};

export const deleteClassroom = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/classrooms/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi xóa lớp học ID ${id}:`, error);
        throw error;
    }
};

export const getClasses = async () => {
    try {
        const response = await api.get(`${API_URL}/classes`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách lớp');
    }
};

export const getCourses = async () => {
    try {
        const response = await api.get(`${API_URL}/courses`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách khóa học');
    }
};

export const getStatuses = async () => {
    try {
        const response = await api.get(`${API_URL}/classStatus`);
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách trạng thái');
    }
};

// Phân công giảng dạy
export const assignTeacherToClassroom = async (classroomId, userId) => {
    try {
        const response = await api.post(`${API_URL}/classrooms/${classroomId}/assign-teacher`, { user_id: userId });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi phân công giảng viên cho lớp học ID ${classroomId}:`, error);
        throw error;
    }
};

export const updateTeacherAssignment = async (classroomId, userId) => {
    try {
        const response = await api.put(`${API_URL}/classrooms/${classroomId}/teacher`, { user_id: userId });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi phân công giảng viên cho lớp học ID ${classroomId}:`, error);
        throw error;
    }
};

export const createScheduleForClassroom = async (classroomId, scheduleData) => {
    try {
        const response = await api.post(`${API_URL}/classrooms/${classroomId}/schedules`, scheduleData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi tạo lịch học cho lớp học ID ${classroomId}:`, error);
        throw error;
    }
};

export const updateClassroomStatus = async (classroomId, statusId) => {
    try {
        const response = await api.patch(`${API_URL}/classrooms/${classroomId}/status`, { status_id: statusId });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái cho lớp học ID ${classroomId}:`, error);
        throw error;
    }
};

export const getClassroomsByTeacher = async (userId) => {
    try {
        const response = await api.get(`${API_URL}/classrooms/teacher/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy danh sách lớp học của giảng viên ID ${userId}:`, error);
        throw error;
    }
};

export const getAllAssignedClassrooms = async () => {
    try {
        const response = await api.get(`${API_URL}/classrooms/assigned`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học phần đã phân công:", error);
        throw error;
    }
};

export const getUserParticipations = async () => {
    try {
        const response = await api.get(`${API_URL}/user-participations`);
        return response.data.data || [];
    } catch (error) {
        console.error('Lỗi khi lấy danh sách UserParticipations:', error);
        throw error;
    }
};

// Lấy danh sách lịch học của lớp học phần
export const getSchedulesByClassroom = async (classroomId) => {
    try {
        const response = await api.get(`${API_URL}/classrooms/${classroomId}/schedules`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Lỗi khi lấy lịch học');
    }
};

// Cập nhật trạng thái hoãn và ngày bù lịch
export const postponeAndMakeupSchedule = async (scheduleId, date, classroomId, isPostponed, makeupDate) => {
    const response = await api.put(`${API_URL}/classrooms/${classroomId}/schedules/${scheduleId}/${date}`, {
        is_postponed: isPostponed,
        makeup_date: makeupDate,
    }, {
        params: { classroom_id: classroomId },
    });
    return response.data;
};

// Lấy danh sách sinh viên của một lớp học phần
export const getStudentsByClassroom = async (classroomId) => {
    try {
        const response = await api.get(`${API_URL}/classrooms/${classroomId}/students`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Thêm token nếu cần
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Lỗi khi lấy danh sách sinh viên: ' + error.message);
    }
};

export const addStudentToClassroom = async (classroomId, studentId) => {
    try {
        const response = await api.post(`${API_URL}/classrooms/${classroomId}/students`, { student_id: studentId });
        console.log(studentId);
        console.log(response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            throw { status, message: data?.message || 'Lỗi từ server không xác định!' };
        } else {
            throw { status: 500, message: 'Lỗi mạng hoặc không thể kết nối đến server!' };
        }
    }
};


// Nhập danh sách sinh viên từ file Excel
export const importStudentsToClassroom = async (classroomId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await api.post(`${API_URL}/classrooms/${classroomId}/students/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`, // Thêm token nếu cần
            },
        });
        return response.data;
    } catch (error) {
        throw new Error('Lỗi khi nhập sinh viên từ file: ' + error.message);
    }
};
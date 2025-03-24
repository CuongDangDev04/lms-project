import api from "./api";
const API_URL = "/api";
const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const fetchLectureOnClassroom = async (classroomId) => {
    const token = getToken();
    const response = await api.get(`${API_URL}/lectures/classroom/${classroomId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data;
};

export const uploadLecture = async (classroomId, files, title, description) => {
    const token = getToken();
    if (!token) throw new Error('No token found, please login again.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description || '');
    if (files && files.length > 0) {
        files.forEach(file => formData.append('files', file)); // Đúng với backend
    }

    const response = await api.post(`${API_URL}/lectures/upload/${classroomId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const downloadLecture = async (lectureId, fileIndex = null) => {
    const token = getToken();
    if (!token) throw new Error('No token found, please login again.');
  
    const response = await api.get(
      `${API_URL}/lectures/download/${lectureId}${fileIndex !== null ? `?fileIndex=${fileIndex}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      }
    );
  
    // Extract filename from Content-Disposition header
    let filename = fileIndex !== null ? `file_${fileIndex}` : `lecture_${lectureId}.zip`;
    
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      // Try RFC 5987 encoding format first (filename*=UTF-8''...)
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (filenameStarMatch && filenameStarMatch[1]) {
        filename = decodeURIComponent(filenameStarMatch[1]);
      } else {
        // Fall back to standard format (filename="...")
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
    }
  
    const fileUrl = window.URL.createObjectURL(new Blob([response.data], { 
      type: response.headers['content-type'] 
    }));
    
    return { fileUrl, filename };
};

export const getUserParticipationId = async (userId, classroomId) => {
    const token = getToken();
    if (!token) throw new Error('No token found, please login again.');

    const response = await api.get(`${API_URL}/lectures/user-participation/${userId}/${classroomId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.user_participation_id;
};

export const updateLecture = async (lectureId, files, title, description, removeFileIndices = []) => {
    const token = getToken();
    if (!token) throw new Error('No token found, please login again.');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('removeFileIndices', JSON.stringify(removeFileIndices));
    
    if (files && files.length > 0) {
        files.forEach(file => formData.append('files', file));
    }
    
    
    
    const response = await api.put(`${API_URL}/lectures/${lectureId}`, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}` 
        },
    });
    
    return response.data;
};

export const deleteLecture = async (lectureId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found, please login again.');

        const response = await api.delete(`${API_URL}/lectures/${lectureId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting lecture:', error);
        throw error;
    }
};
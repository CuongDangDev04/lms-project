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
    if (!token) throw new Error("No token found, please login again.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description || "");
    files.forEach((file) => formData.append("files", file));

    try {
        console.log('service được gọii đến apiiiiii')
        const response = await api.post(`api/lectures/upload/${classroomId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        console.log('response upload lecture', response.data);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Upload failed: ${errorMessage}`);
    }
}

export const downloadLecture = async (lectureId, fileIndex = null) => {
    const token = getToken();
    if (!token) throw new Error('No token found, please login again.');

    try {
        console.log(`Requesting download for lecture: ${lectureId}, fileIndex: ${fileIndex}`);
        
        const response = await api.get(
            `${API_URL}/lectures/download/${lectureId}${fileIndex !== null ? `?fileIndex=${fileIndex}` : ''}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            }
        );

        console.log("Download response headers:", response.headers);
        
        let filename = fileIndex !== null ? `file_${fileIndex}` : `lecture_${lectureId}.zip`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
            if (filenameStarMatch && filenameStarMatch[1]) {
                filename = decodeURIComponent(filenameStarMatch[1]);
            } else {
                const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
        }

        const fileUrl = window.URL.createObjectURL(
            new Blob([response.data], { type: response.headers['content-type'] })
        );
        
        console.log(`Download successful: ${filename}`);
        return { fileUrl, filename };
    } catch (error) {
        console.error("Download error details:", error.response || error);
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Download failed: ${errorMessage}`);
    }
};

export const updateLecture = async (lectureId, files, title, description, removeFileIndices = []) => {
    const token = getToken();
    if (!token) throw new Error('No token found, please login again.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('removeFileIndices', JSON.stringify(removeFileIndices));

    if (files && files.length > 0) {
        console.log(`Appending ${files.length} files to form data`);
        files.forEach(file => formData.append('files', file));
    }

    try {
        console.log(`Sending update request for lecture ID: ${lectureId}`);
        console.log(`Remove file indices: ${JSON.stringify(removeFileIndices)}`);
        
        const response = await api.put(`${API_URL}/lectures/${lectureId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            },
        });

        console.log("Update response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Update error details:", error.response || error);
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Update failed: ${errorMessage}`);
    }
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



export const deleteLecture = async (lectureId) => {
    try {
        const token = getToken();
        if (!token) throw new Error('No token found, please login again.');

        console.log(`Sending delete request for lecture ID: ${lectureId}`);
        
        const response = await api.delete(`${API_URL}/lectures/${lectureId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        console.log("Delete response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Delete error details:", error.response || error);
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Delete failed: ${errorMessage}`);
    }
};
// src/hooks/useClassroomData.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    getClassrooms,
    getStatuses,
    getUserParticipations,
    getClasses,
    getCourses,
} from '../services/classRoomServices';
import { getInstructors } from '../services/userServices';

const useClassroomData = (filterMode) => {
    const [classrooms, setClassrooms] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [userParticipations, setUserParticipations] = useState([]);
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classroomsData, teachersData, statusesData, participationsData, classesData, coursesData] = await Promise.all([
                getClassrooms(),
                getInstructors(),
                getStatuses(),
                getUserParticipations(),
                getClasses(),
                getCourses(),
            ]);

            const classroomList = Array.isArray(classroomsData) ? classroomsData : [];
            const participationList = Array.isArray(participationsData) ? participationsData : [];
            const teachersList = Array.isArray(teachersData) ? teachersData : [];
            const assignedClassroomIds = new Set(participationList.map((p) => p.classroom_id));

            let filteredClassrooms = classroomList;
            if (filterMode === 'unassigned') {
                filteredClassrooms = classroomList.filter((c) => !assignedClassroomIds.has(c.classroom_id));
            } else if (filterMode === 'assigned') {
                const teacherMap = new Map(teachersList.map((t) => [t.user_id, t.fullname || t.username]));
                filteredClassrooms = classroomList
                    .filter((c) => assignedClassroomIds.has(c.classroom_id))
                    .map((c) => {
                        const participation = participationList.find((p) => p.classroom_id === c.classroom_id);
                        const teacherName = participation ? teacherMap.get(participation.user_id) || 'N/A' : 'N/A';
                        return { ...c, assignedTeacherName: teacherName };
                    });
            }

            setClassrooms(filteredClassrooms);
            setTeachers(teachersList);
            setStatuses(Array.isArray(statusesData) ? statusesData : []);
            setUserParticipations(participationList);
            setClasses(Array.isArray(classesData) ? classesData : []);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterMode]);

    return {
        classrooms,
        teachers,
        statuses,
        userParticipations,
        classes,
        courses,
        loading,
        fetchData,
    };
};

export default useClassroomData;
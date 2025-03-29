import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ModalCustom } from '../../components/admin/ui/ModalCustom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaCalendarAlt, FaEdit, FaCalendar, FaClock, FaBan, FaRedo, FaArrowLeft } from 'react-icons/fa';
import { format, addDays, addWeeks, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import useClassroomData from '../../hooks/useClassroomData';
import ClassroomTable from '../../components/admin/ClassroomTable';
import Pagination from '../../components/admin/Pagination';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    assignTeacherToClassroom,
    createScheduleForClassroom,
    updateClassroomStatus,
    getSchedulesByClassroom,
    postponeAndMakeupSchedule,
    updateTeacherAssignment
} from '../../services/classRoomServices';
import NotificationService from '../../services/notificationService';

const AssignedClassroomManager = () => {
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);
    const [isExamScheduleOpen, setIsExamScheduleOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [currentClassroom, setCurrentClassroom] = useState(null);
    const [currentClassroomSchedules, setCurrentClassroomSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [makeupDate, setMakeupDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignFormData, setAssignFormData] = useState({ user_id: '' });
    const [scheduleFormData, setScheduleFormData] = useState({
        event_type: '',
        weekdays: '',
        start_time: '',
        end_time: '',
        description: '',
        start_date: null,
        end_date: null,
        numberOfSessions: '',
    });
    const [examFormData, setExamFormData] = useState({
        event_type: 'Thi',
        exam_date: null,
        start_time: '',
        end_time: '',
        description: '',
    });
    const [statusFormData, setStatusFormData] = useState({ status_id: '' });
    const [modalView, setModalView] = useState('scheduleList');

    const navigate = useNavigate();
    const location = useLocation();
    const { classrooms, teachers, statuses, loading, fetchData } = useClassroomData('assigned');
    const entitiesPerPage = 6;

    useEffect(() => {
        document.title = 'Quản lý lớp đã phân công - BrainHub LMS';
    }, []);

    const filteredClassrooms = useMemo(() => {
        return classrooms.filter((c) =>
            Object.values(c).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [classrooms, searchTerm]);

    const paginatedClassrooms = filteredClassrooms.slice((currentPage - 1) * entitiesPerPage, currentPage * entitiesPerPage);
    const totalPages = Math.ceil(filteredClassrooms.length / entitiesPerPage);

    const checkScheduleCount = async (classroomId) => {
        try {
            const schedules = await getSchedulesByClassroom(classroomId);
            const normalSchedules = schedules.filter(s => s.event_type !== 'Thi');
            const examSchedules = schedules.filter(s => s.event_type === 'Thi');
            return {
                normalCount: normalSchedules.length,
                examCount: examSchedules.length,
            };
        } catch (error) {
            return { normalCount: 0, examCount: 0 };
        }
    };

    const handleAssignTeacher = async (e) => {
        e.preventDefault();
        if (!assignFormData.user_id) return toast.error('Vui lòng chọn giảng viên!');
        try {
            await updateTeacherAssignment(currentClassroom.classroom_id, assignFormData.user_id);
            fetchData();
            setIsAssignOpen(false);

            const notificationData = {
                target_user_id: assignFormData.user_id, // Sử dụng user_id của học sinh
                notificationType: "system",
                message: `Bạn đã đượcphân công giảng dạy lớp học này`,
            };
            await NotificationService.sendNotificationToSpecificUser(notificationData);
            toast.success('Cập nhật phân công giảng viên thành công!');
        } catch (error) {
            toast.warning('Giảng viên đã có lịch dạy bị trùng!');
        }
    };

    const calculateEndDate = (startDate, sessions) => {
        if (!startDate || !sessions || isNaN(sessions) || sessions <= 0) return null;
        return addWeeks(startDate, sessions - 1);
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        if (!scheduleFormData.event_type || !scheduleFormData.weekdays || !scheduleFormData.start_time || !scheduleFormData.end_time || !scheduleFormData.start_date || !scheduleFormData.end_date) {
            return toast.error('Vui lòng điền đầy đủ thông tin lịch học!');
        }
        try {
            await createScheduleForClassroom(currentClassroom.classroom_id, scheduleFormData);
            fetchData();
            setIsScheduleOpen(false);
            toast.success('Tạo lịch học thành công!');
            fetchClassroomSchedules(currentClassroom.classroom_id);
        } catch (error) {
            toast.error('Lỗi khi tạo lịch học!');
        }
    };

    const handleCreateExamSchedule = async (e) => {
        e.preventDefault();
        if (!examFormData.exam_date || !examFormData.start_time || !examFormData.end_time) {
            return toast.error('Vui lòng điền đầy đủ thông tin lịch thi!');
        }
        try {
            const examSchedule = {
                event_type: 'Thi',
                exam_date: format(examFormData.exam_date, 'yyyy-MM-dd'),
                start_time: examFormData.start_time,
                end_time: examFormData.end_time,
                description: examFormData.description,
            };
            await createScheduleForClassroom(currentClassroom.classroom_id, examSchedule);
            fetchData();
            setIsExamScheduleOpen(false);
            toast.success('Tạo lịch thi thành công!');
            fetchClassroomSchedules(currentClassroom.classroom_id);
        } catch (error) {
            toast.error('Lỗi khi tạo lịch thi!');
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!statusFormData.status_id) return toast.error('Vui lòng chọn trạng thái!');
        try {
            await updateClassroomStatus(currentClassroom.classroom_id, statusFormData.status_id);
            fetchData();
            setIsEditStatusOpen(false);
            toast.success('Cập nhật trạng thái thành công!');
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái!');
        }
    };

    const fetchClassroomSchedules = async (classroomId) => {
        try {
            const schedules = await getSchedulesByClassroom(classroomId);
            const formattedSchedules = schedules.map(schedule => {
                const date = schedule.date ? new Date(schedule.date) : schedule.exam_date ? new Date(schedule.exam_date) : null;
                const makeupDate = schedule.makeup_date ? new Date(schedule.makeup_date) : null;
                let eventTypeLabel = schedule.event_type === 'Thi' ? 'Lịch Thi' : 'Lịch Học';
                if (schedule.is_postponed && schedule.event_type === 'Thi') eventTypeLabel = 'Lịch Thi (Hoãn)';
                else if (schedule.is_postponed) eventTypeLabel = 'Lịch Học (Hoãn)';
                if (schedule.parent_schedule_id) eventTypeLabel += ' (Bù)';
                return {
                    schedule_id: schedule.schedule_id,
                    date: date && isValid(date) ? date : null,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    event_type: eventTypeLabel,
                    description: schedule.description,
                    is_postponed: schedule.is_postponed,
                    makeup_date: makeupDate && isValid(makeupDate) ? makeupDate : null,
                    parent_schedule_id: schedule.parent_schedule_id,
                    original_event_type: schedule.event_type, // Lưu loại sự kiện gốc để kiểm tra
                };
            });
            formattedSchedules.sort((a, b) => (a.date && b.date) ? a.date - b.date : 0);
            setCurrentClassroomSchedules(formattedSchedules);
            setIsScheduleModalOpen(true);
            setModalView('scheduleList');
        } catch (error) {
            toast.warning('Lịch học của lớp học phần này chưa được tạo!');
        }
    };

    const handlePostponeSchedule = async (schedule) => {
        try {
            if (!schedule.date || !isValid(schedule.date)) {
                throw new Error('Ngày lịch học không hợp lệ');
            }
            const response = await postponeAndMakeupSchedule(
                schedule.schedule_id,
                format(schedule.date, 'yyyy-MM-dd'),
                currentClassroom.classroom_id,
                !schedule.is_postponed,
                null
            );
            toast.success(response.message);
            fetchClassroomSchedules(currentClassroom.classroom_id);
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái hoãn lịch: ' + error.message);
            console.error('Error in handlePostponeSchedule:', error);
        }
    };

    const handleMakeupSchedule = async () => {
        if (!makeupDate) {
            toast.error('Vui lòng chọn ngày bù!');
            return;
        }
        try {
            const response = await postponeAndMakeupSchedule(
                selectedSchedule.schedule_id,
                format(selectedSchedule.date, 'yyyy-MM-dd'),
                currentClassroom.classroom_id,
                true,
                format(makeupDate, 'yyyy-MM-dd')
            );
            toast.success(response.message);
            fetchClassroomSchedules(currentClassroom.classroom_id);
            setModalView('scheduleList');
        } catch (error) {
            toast.error('Lỗi khi cập nhật ngày bù lịch: ' + error.message);
            console.error('Error in handleMakeupSchedule:', error);
        }
    };

    const handleOpenMakeupView = (schedule) => {
        if (schedule.makeup_date || schedule.parent_schedule_id) {
            toast.warning('Lịch này đã có ngày bù, không thể chọn thêm!');
            return;
        }
        setSelectedSchedule(schedule);
        setMakeupDate(null);
        setModalView('makeup');
    };

    const columns = [
        { label: 'ID', key: 'classroom_id', render: (c) => c.classroom_id },
        { label: 'Tên Lớp Học Phần', key: 'class_id', render: (c) => c.Class?.class_name || 'N/A' },
        { label: 'Khóa Học', key: 'course_id', render: (c) => c.Course?.course_name || 'N/A' },
        { label: 'Giảng Viên', key: 'assignedTeacherName', render: (c) => c.assignedTeacherName || 'N/A' },
        { label: 'Trạng Thái', key: 'status_id', render: (c) => c.class_status?.status_name || 'N/A' },
    ];

    const actions = [
        { type: 'assign', icon: <FaUserPlus size={16} />, className: 'p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 transform hover:scale-110', title: 'Cập nhật phân công giảng viên' },
        { type: 'schedule', icon: <FaCalendarAlt size={16} />, className: 'p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-all duration-300 transform hover:scale-110', title: 'Tạo lịch học' },
        { type: 'editStatus', icon: <FaEdit size={16} />, className: 'p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-all duration-300 transform hover:scale-110', title: 'Cập nhật trạng thái' },
        { type: 'viewSchedule', icon: <FaCalendar size={16} />, className: 'p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-all duration-300 transform hover:scale-110', title: 'Xem lịch của lớp học phần' },
        { type: 'examSchedule', icon: <FaClock size={16} />, className: 'p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-all duration-300 transform hover:scale-110', title: 'Tạo lịch thi' },
    ];

    const handleActionClick = async (type, classroom) => {
        setCurrentClassroom(classroom);
        const { normalCount, examCount } = await checkScheduleCount(classroom.classroom_id);

        if (type === 'assign') {
            setAssignFormData({ user_id: '' });
            setIsAssignOpen(true);
        } else if (type === 'schedule') {
            setScheduleFormData({
                event_type: '',
                weekdays: '',
                start_time: '',
                end_time: '',
                description: '',
                start_date: classroom.start_date ? new Date(classroom.start_date) : null,
                end_date: classroom.end_date ? new Date(classroom.end_date) : null,
                numberOfSessions: '',
            });
            setIsScheduleOpen(true);
        } else if (type === 'editStatus') {
            setStatusFormData({ status_id: classroom.status_id || '' });
            setIsEditStatusOpen(true);
        } else if (type === 'viewSchedule') {
            fetchClassroomSchedules(classroom.classroom_id);
        } else if (type === 'examSchedule') {
            setExamFormData({
                event_type: 'Thi',
                exam_date: null,
                start_time: '',
                end_time: '',
                description: '',
            });
            setIsExamScheduleOpen(true);
        }
    };

    const weekdayOptions = [
        { value: '2', label: 'Thứ 2' }, { value: '3', label: 'Thứ 3' }, { value: '4', label: 'Thứ 4' },
        { value: '5', label: 'Thứ 5' }, { value: '6', label: 'Thứ 6' }, { value: '7', label: 'Thứ 7' },
        { value: '8', label: 'Chủ nhật' },
    ];

    const getWeekdayFromDate = (date) => {
        if (!date || !isValid(date)) return '';
        const day = date.getDay();
        const mapping = { 0: '8', 1: '2', 2: '3', 3: '4', 4: '5', 5: '6', 6: '7' };
        return mapping[day] || '';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li>
                            <button
                                onClick={() => navigate('/admin')}
                                className="hover:text-teal-600 transition-colors duration-200"
                            >
                                Trang chủ
                            </button>
                        </li>
                        <li>
                            <span className="mx-1">/</span>
                            <button
                                onClick={() => navigate('/admin/manager-assign')}
                                className="hover:text-teal-600 transition-colors duration-200"
                            >
                                Giảng dạy và phân công
                            </button>
                        </li>
                        <li>
                            <span className="mx-1">/</span>
                            <span className="text-teal-600 font-medium">
                                Lớp đã phân công
                            </span>
                        </li>
                    </ol>
                </nav>
                <div className="flex flex-col mt-12 sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-600 tracking-tight text-center sm:text-left">
                        Quản Lý Lớp Đã Phân Công
                    </h2>
                </div>
                <style>
                    {`
                    .react-datepicker-wrapper {
                        width: 100%;
                    }
                    .react-datepicker__input-container input {
                        width: 100%;
                        padding: 0.5rem 2.5rem 0.5rem 0.75rem;
                        border: 1px solid #d1d5db;
                        border-radius: 0.5rem;
                        background-color: white;
                        font-size: 0.875rem;
                        line-height: 1.25rem;
                        color: #374151;
                        transition: all 0.2s ease-in-out;
                    }
                    .react-datepicker__input-container input:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
                    }
                    .react-datepicker__input-container input::placeholder {
                        color: #9ca3af;
                    }
                    .custom-datepicker {
                        font-family: Arial, sans-serif;
                        border: 1px solid #d1d5db;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        z-index: 12000 !important;
                        width: 400px !important;
                        height: 400px !important;
                        padding: 15px;
                    }
                    .custom-datepicker .react-datepicker__header {
                        background: linear-gradient(to right, #14b8a6, #06b6d4);
                        color: white;
                        border-bottom: none;
                        padding: 1.5rem;
                        border-top-left-radius: 0.5rem;
                        border-top-right-radius: 0.5rem;
                    }
                    .custom-datepicker .react-datepicker__current-month {
                        font-size: 1.3rem;
                        font-weight: 600;
                    }
                    .custom-datepicker .react-datepicker__day-name,
                    .custom-datepicker .react-datepicker__day {
                        color: #374151;
                        width: 2.8rem;
                        height: 2.8rem;
                        line-height: 2.8rem;
                        margin: 0.4rem;
                        font-size: 1.1rem;
                    }
                    .custom-datepicker .react-datepicker__day--selected,
                    .custom-datepicker .react-datepicker__day--keyboard-selected {
                        background-color: #14b8a6;
                        color: white;
                        border-radius: 50%;
                    }
                    .custom-datepicker .react-datepicker__day--selected:hover,
                    .custom-datepicker .react-datepicker__day--keyboard-selected:hover {
                        background-color: #06b6d4;
                    }
                    .custom-datepicker .react-datepicker__day:hover {
                        background-color: #e5e7eb;
                        border-radius: 50%;
                    }
                    .custom-datepicker .react-datepicker__day--disabled {
                        color: #d1d5db;
                        cursor: not-allowed;
                    }
                    .custom-datepicker .react-datepicker__navigation-icon::before {
                        border-color: white;
                    }
                    .exam-schedule-row {
                        background-color: #fff3cd;
                    }
                    .exam-postponed-row {
                        background-color: #fed7aa;
                    }
                    .custom-datepicker-popper {
                        z-index: 12000 !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                    }
                    .modal-content {
                        min-height: 350px;
                    }
                    @media (max-width: 640px) {
                        .min-w-[450px] {
                            min-width: 90vw;
                            max-width: 90vw;
                        }
                        .custom-datepicker {
                            width: 90vw !important;
                            height: 350px !important;
                        }
                        .custom-datepicker-popper {
                            left: 0 !important;
                            transform: translate(0, -50%) !important;
                        }
                    }
                    `}
                </style>
                <div className="mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm lớp học phần đã phân công..."
                        className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400"
                    />
                </div>

                {loading ? (
                    <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
                ) : filteredClassrooms.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">Không có lớp học phần nào đã được phân công để hiển thị.</div>
                ) : (
                    <>
                        <ClassroomTable classrooms={paginatedClassrooms} columns={columns} actions={actions} onActionClick={handleActionClick} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}

                <ModalCustom title="Cập Nhật Phân Công Giảng Viên" open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                    <form onSubmit={handleAssignTeacher} className="space-y-4 mt-4">
                        <select
                            value={assignFormData.user_id}
                            onChange={(e) => setAssignFormData({ ...assignFormData, user_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn giảng viên</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.user_id} value={teacher.user_id}>
                                    {teacher.fullname || teacher.username}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                        >
                            Cập Nhật
                        </button>
                    </form>
                </ModalCustom>

                <ModalCustom title="Tạo Lịch Học" open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                    <form onSubmit={handleCreateSchedule} className="space-y-6 mt-6">
                        <input
                            type="text"
                            value={scheduleFormData.event_type}
                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, event_type: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="Loại sự kiện"
                        />
                        <select
                            value={scheduleFormData.weekdays}
                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, weekdays: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn ngày trong tuần</option>
                            {weekdayOptions.map((day) => (
                                <option key={day.value} value={day.value}>{day.label}</option>
                            ))}
                        </select>
                        <input
                            type="time"
                            value={scheduleFormData.start_time}
                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, start_time: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                        <input
                            type="time"
                            value={scheduleFormData.end_time}
                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, end_time: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        />
                        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Bắt Đầu</label>
                                <DatePicker
                                    selected={scheduleFormData.start_date}
                                    onChange={(date) => {
                                        const weekdays = getWeekdayFromDate(date);
                                        const endDate = calculateEndDate(date, scheduleFormData.numberOfSessions);
                                        setScheduleFormData({
                                            ...scheduleFormData,
                                            start_date: date,
                                            weekdays: weekdays,
                                            end_date: endDate
                                        });
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Chọn ngày bắt đầu"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    locale={vi}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Kết Thúc</label>
                                <DatePicker
                                    selected={scheduleFormData.end_date}
                                    onChange={(date) => setScheduleFormData({ ...scheduleFormData, end_date: date })}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="Chọn ngày kết thúc"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required
                                    locale={vi}
                                    minDate={scheduleFormData.start_date}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số Buổi Học</label>
                            <input
                                type="number"
                                min="1"
                                value={scheduleFormData.numberOfSessions}
                                onChange={(e) => {
                                    const sessions = e.target.value;
                                    const endDate = calculateEndDate(scheduleFormData.start_date, sessions);
                                    setScheduleFormData({
                                        ...scheduleFormData,
                                        numberOfSessions: sessions,
                                        end_date: endDate
                                    });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                placeholder="Nhập số buổi học"
                            />
                        </div>
                        <textarea
                            value={scheduleFormData.description}
                            onChange={(e) => setScheduleFormData({ ...scheduleFormData, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Mô tả"
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                        >
                            Tạo Lịch
                        </button>
                    </form>
                </ModalCustom>

                <ModalCustom title="Tạo Lịch Thi" open={isExamScheduleOpen} onOpenChange={setIsExamScheduleOpen}>
                    <form onSubmit={handleCreateExamSchedule} className="space-y-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày Thi</label>
                            <DatePicker
                                selected={examFormData.exam_date}
                                onChange={(date) => setExamFormData({ ...examFormData, exam_date: date })}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Chọn ngày thi"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                                locale={vi}
                                minDate={currentClassroom?.end_date && isValid(new Date(currentClassroom.end_date)) ? addDays(new Date(currentClassroom.end_date), 1) : new Date()}
                            />
                        </div>
                        <input
                            type="time"
                            value={examFormData.start_time}
                            onChange={(e) => setExamFormData({ ...examFormData, start_time: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="Giờ bắt đầu"
                        />
                        <input
                            type="time"
                            value={examFormData.end_time}
                            onChange={(e) => setExamFormData({ ...examFormData, end_time: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="Giờ kết thúc"
                        />
                        <textarea
                            value={examFormData.description}
                            onChange={(e) => setExamFormData({ ...examFormData, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Mô tả"
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-600"
                        >
                            Tạo Lịch Thi
                        </button>
                    </form>
                </ModalCustom>

                <ModalCustom title="Cập Nhật Trạng Thái" open={isEditStatusOpen} onOpenChange={setIsEditStatusOpen}>
                    <form onSubmit={handleUpdateStatus} className="space-y-4 mt-4">
                        <select
                            value={statusFormData.status_id}
                            onChange={(e) => setStatusFormData({ ...statusFormData, status_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn trạng thái</option>
                            {statuses.map((status) => (
                                <option key={status.status_id} value={status.status_id}>{status.status_name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                        >
                            Cập Nhật
                        </button>
                    </form>
                </ModalCustom>

                <ModalCustom
                    title={modalView === 'scheduleList' ? 'Lịch Của Lớp Học Phần' : 'Chọn Ngày Bù'}
                    open={isScheduleModalOpen}
                    onOpenChange={setIsScheduleModalOpen}
                    className="min-w-[450px] max-w-[600px] min-h-[500px] bg-white rounded-lg shadow-lg"
                >
                    <div className="space-y-6 mt-6 p-6">
                        {modalView === 'scheduleList' ? (
                            <>
                                {currentClassroomSchedules.length > 0 ? (
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="min-w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Ngày</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Thời Gian</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Loại Sự Kiện</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Trạng Thái Hoãn</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Hành Động</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentClassroomSchedules.map((schedule, index) => (
                                                    <tr
                                                        key={schedule.schedule_id}
                                                        className={`${schedule.is_postponed && schedule.original_event_type !== 'Thi' ? 'bg-red-100' :
                                                            schedule.is_postponed && schedule.original_event_type === 'Thi' ? 'exam-postponed-row' :
                                                                schedule.parent_schedule_id ? 'bg-blue-100' :
                                                                    schedule.original_event_type === 'Thi' ? 'exam-schedule-row' : ''} border-b`}
                                                    >
                                                        <td className="px-4 py-2 text-sm text-gray-700">
                                                            {schedule.date && isValid(schedule.date) ? format(schedule.date, "EEEE, dd 'tháng' MM, yyyy", { locale: vi }) : 'N/A'}
                                                            {schedule.makeup_date && isValid(schedule.makeup_date) && (
                                                                <span className="text-xs text-blue-600"> (Bù: {format(schedule.makeup_date, "dd/MM/yyyy")})</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-700">{schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700">{schedule.event_type}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700">{schedule.is_postponed ? 'Đã hoãn' : 'Chưa hoãn'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-700 flex space-x-2">
                                                            <button
                                                                onClick={() => handlePostponeSchedule(schedule)}
                                                                className={`p-2 rounded-full ${schedule.is_postponed ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'} transition-all duration-300 transform hover:scale-110`}
                                                                title={schedule.is_postponed ? 'Bỏ hoãn' : 'Hoãn lịch'}
                                                                disabled={schedule.parent_schedule_id}
                                                            >
                                                                <FaBan size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenMakeupView(schedule)}
                                                                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 transform hover:scale-110"
                                                                title="Bù lịch"
                                                                disabled={schedule.parent_schedule_id || schedule.makeup_date}
                                                            >
                                                                <FaRedo size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Không có lịch học nào được tìm thấy cho lớp học phần này.</p>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày Bù</label>
                                    <DatePicker
                                        selected={makeupDate}
                                        onChange={(date) => setMakeupDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Chọn ngày bù"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        required
                                        locale={vi}
                                        minDate={currentClassroom?.start_date && isValid(new Date(currentClassroom.start_date)) ? new Date(currentClassroom.start_date) : new Date()}
                                    />
                                </div>
                                <button
                                    onClick={handleMakeupSchedule}
                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700"
                                    disabled={!makeupDate}
                                >
                                    Xác Nhận Ngày Bù
                                </button>
                            </div>
                        )}
                        <div className="flex justify-between mt-4">
                            {modalView === 'makeup' && (
                                <button
                                    onClick={() => setModalView('scheduleList')}
                                    className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all duration-300 transform hover:scale-110"
                                    title="Quay lại"
                                >
                                    <FaArrowLeft size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </ModalCustom>

                <ToastContainer limit={1} position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="light" className="mt-4 sm:mt-6" />
            </div>
        </div>
    );
};

export default AssignedClassroomManager;
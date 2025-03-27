import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaEdit } from 'react-icons/fa';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    assignTeacherToClassroom,
    addClassroom,
    updateClassroom,
    deleteClassroom,
} from '../../services/classRoomServices';
import { ModalCustom } from '../../components/admin/ui/ModalCustom';
import useClassroomData from '../../hooks/useClassroomData';
import ClassroomTable from '../../components/admin/ClassroomTable';
import Pagination from '../../components/admin/Pagination';
import NotificationService from '../../services/notificationService';

registerLocale('vi', vi);

const UnAssigmentManager = () => {
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentClassroom, setCurrentClassroom] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignFormData, setAssignFormData] = useState({ user_id: '' });
    const [addFormData, setAddFormData] = useState({
        class_id: '',
        course_id: '',
        status_id: '',
        start_date: '',
        end_date: '',
        numberOfSessions: '',
    });
    const [editFormData, setEditFormData] = useState({
        classroom_id: '',
        class_id: '',
        course_id: '',
        status_id: '',
        start_date: '',
        end_date: '',
        numberOfSessions: '',
    });
    const [viewMode, setViewMode] = useState('all');
    const entitiesPerPage = 6;

    const location = useLocation();
    const { classrooms, teachers, statuses, classes, courses, loading, fetchData } = useClassroomData(viewMode === 'all' ? 'all' : 'unassigned');
    const today = new Date();

    const filteredClassrooms = useMemo(() => {
        return classrooms.filter((c) =>
            Object.values(c).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [classrooms, searchTerm]);

    const paginatedClassrooms = filteredClassrooms.slice((currentPage - 1) * entitiesPerPage, currentPage * entitiesPerPage);
    const totalPages = Math.ceil(filteredClassrooms.length / entitiesPerPage);

    const calculateEndDate = (startDate, sessions) => {
        if (!startDate || !sessions || isNaN(sessions) || sessions <= 0) return '';
        return format(addDays(new Date(startDate), (sessions - 1) * 7), 'yyyy-MM-dd');
    };

    const handleAssignTeacher = async (e) => {
        e.preventDefault();
        if (!assignFormData.user_id) return toast.error('Vui lòng chọn giảng viên!');
        try {
            await assignTeacherToClassroom(currentClassroom.classroom_id, assignFormData.user_id);
            fetchData();
            setIsAssignOpen(false);
            const notificationData = {
                target_user_id: assignFormData.user_id, // Sử dụng user_id của học sinh
                notificationType: "system",
                message: `Bạn đã được phân công giảng dạy lớp học này`,
            };
            await NotificationService.sendNotificationToSpecificUser(notificationData);
            toast.success('Phân công giảng viên thành công!');
        } catch (error) {
            toast.error('Lỗi khi phân công giảng viên!');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!addFormData.class_id || !addFormData.course_id || !addFormData.status_id || !addFormData.start_date || !addFormData.numberOfSessions) {
            return toast.error('Vui lòng điền đầy đủ thông tin!');
        }
        try {
            const dataToSubmit = { ...addFormData, end_date: calculateEndDate(addFormData.start_date, addFormData.numberOfSessions) };
            await addClassroom(dataToSubmit);
            fetchData();
            setAddFormData({ class_id: '', course_id: '', status_id: '', start_date: '', end_date: '', numberOfSessions: '' });
            setIsAddOpen(false);
            toast.success('Thêm lớp học phần thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm lớp học phần!');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editFormData.class_id || !editFormData.course_id || !editFormData.status_id || !editFormData.start_date || !editFormData.numberOfSessions) {
            return toast.error('Vui lòng điền đầy đủ thông tin!');
        }
        try {
            const dataToSubmit = { ...editFormData, end_date: calculateEndDate(editFormData.start_date, editFormData.numberOfSessions) };
            await updateClassroom(editFormData.classroom_id, dataToSubmit);
            fetchData();
            setIsEditOpen(false);
            toast.info('Cập nhật lớp học phần thành công!');
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật lớp học phần!');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteClassroom(deleteId);
            fetchData();
            setIsDeleteOpen(false);
            toast.success('Xóa lớp học phần thành công!');
            if (paginatedClassrooms.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa lớp học phần!');
        }
    };

    const columns = [
        { label: 'ID', key: 'classroom_id', render: (c) => c.classroom_id },
        { label: 'Tên Lớp Học Phần', key: 'class_id', render: (c) => c.Class?.class_name || 'N/A' },
        { label: 'Khóa Học', key: 'course_id', render: (c) => c.Course?.course_name || 'N/A' },
        { label: 'Trạng Thái', key: 'status_id', render: (c) => c.class_status?.status_name || 'N/A' },
        { label: 'Ngày Bắt Đầu', key: 'start_date', render: (c) => c.start_date ? format(new Date(c.start_date), "EEEE, dd 'tháng' MM, yyyy", { locale: vi }) : 'N/A' },
        { label: 'Ngày Kết Thúc', key: 'end_date', render: (c) => c.end_date ? format(new Date(c.end_date), "EEEE, dd 'tháng' MM, yyyy", { locale: vi }) : 'N/A' },
    ];

    const actions = [
        ...(viewMode === 'unassigned' ? [{
            type: 'assign',
            icon: <FaUserPlus size={16} />,
            className: 'p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 transform hover:scale-110',
            title: 'Phân công giảng viên'
        }] : []),
        { type: 'edit', icon: <FaEdit size={16} />, className: 'p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-all duration-300 transform hover:scale-110', title: 'Chỉnh sửa' },
    ];

    const handleActionClick = (type, classroom) => {
        setCurrentClassroom(classroom);
        if (type === 'assign') {
            setAssignFormData({ user_id: '' });
            setIsAssignOpen(true);
        } else if (type === 'edit') {
            setEditFormData({
                classroom_id: classroom.classroom_id,
                class_id: classroom.class_id || '',
                course_id: classroom.course_id || '',
                status_id: classroom.status_id || '',
                start_date: classroom.start_date ? new Date(classroom.start_date) : null,
                end_date: classroom.end_date ? new Date(classroom.end_date) : null,
                numberOfSessions: classroom.end_date && classroom.start_date ? Math.ceil((new Date(classroom.end_date) - new Date(classroom.start_date)) / (1000 * 60 * 60 * 24 * 7)) + 1 : '',
            });
            setIsEditOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
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
                    .react-datepicker {
                        font-family: Arial, sans-serif;
                        border: 1px solid #d1d5db;
                        border-radius: 0.5rem;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .react-datepicker__header {
                        background: linear-gradient(to right, #14b8a6, #06b6d4);
                        color: white;
                        border-bottom: none;
                        padding: 0.75rem;
                        border-top-left-radius: 0.5rem;
                        border-top-right-radius: 0.5rem;
                    }
                    .react-datepicker__current-month {
                        font-size: 1rem;
                        font-weight: 600;
                    }
                    .react-datepicker__day-name,
                    .react-datepicker__day {
                        color: #374151;
                        width: 2rem;
                        line-height: 2rem;
                        margin: 0.2rem;
                    }
                    .react-datepicker__day--selected,
                    .react-datepicker__day--keyboard-selected {
                        background-color: #14b8a6;
                        color: white;
                        border-radius: 50%;
                    }
                    .react-datepicker__day--selected:hover,
                    .react-datepicker__day--keyboard-selected:hover {
                        background-color: #06b6d4;
                    }
                    .react-datepicker__day:hover {
                        background-color: #e5e7eb;
                        border-radius: 50%;
                    }
                    .react-datepicker__day--disabled {
                        color: #d1d5db;
                        cursor: not-allowed;
                    }
                    .react-datepicker__navigation-icon::before {
                        border-color: white;
                    }
                `}
            </style>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col mt-10 sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">
                        {viewMode === 'all' ? 'Quản Lý Lớp Học Phần' : 'Lớp Học Phần Chưa Phân Công'}
                    </h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setViewMode(viewMode === 'all' ? 'unassigned' : 'all')}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
                        >
                            {viewMode === 'all' ? 'Xem Lớp Chưa Phân Công' : 'Xem Tất Cả'}
                        </button>
                        {viewMode === 'all' && (
                            <ModalCustom
                                title="Thêm Lớp Học Phần Mới"
                                triggerText="Thêm Lớp Học Phần"
                                open={isAddOpen}
                                onOpenChange={setIsAddOpen}
                            >
                                <form onSubmit={handleCreate} className="space-y-6 mt-6">
                                    <select
                                        value={addFormData.class_id}
                                        onChange={(e) => setAddFormData({ ...addFormData, class_id: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        required
                                    >
                                        <option value="">Chọn lớp</option>
                                        {classes.map((cls) => (
                                            <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={addFormData.course_id}
                                        onChange={(e) => setAddFormData({ ...addFormData, course_id: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        required
                                    >
                                        <option value="">Chọn khóa học</option>
                                        {courses.map((course) => (
                                            <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={addFormData.status_id}
                                        onChange={(e) => setAddFormData({ ...addFormData, status_id: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        required
                                    >
                                        <option value="">Chọn trạng thái</option>
                                        {statuses.map((status) => (
                                            <option key={status.status_id} value={status.status_id}>{status.status_name}</option>
                                        ))}
                                    </select>
                                    <div className="relative">
                                        <DatePicker
                                            selected={addFormData.start_date ? new Date(addFormData.start_date) : null}
                                            onChange={(date) => setAddFormData({
                                                ...addFormData,
                                                start_date: date ? format(date, 'yyyy-MM-dd') : '',
                                                end_date: calculateEndDate(date, addFormData.numberOfSessions)
                                            })}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="dd/mm/yyyy"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            locale="vi"
                                            minDate={today}
                                            required
                                            popperPlacement="bottom-start"
                                            popperModifiers={[
                                                {
                                                    name: 'offset',
                                                    options: {
                                                        offset: [0, 8],
                                                    },
                                                },
                                                {
                                                    name: 'preventOverflow',
                                                    options: {
                                                        rootBoundary: 'document',
                                                        tether: true,
                                                        altAxis: true,
                                                    },
                                                },
                                                {
                                                    name: 'flip',
                                                    options: {
                                                        fallbackPlacements: ['top-start', 'bottom-start'],
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        value={addFormData.numberOfSessions}
                                        onChange={(e) => setAddFormData({
                                            ...addFormData,
                                            numberOfSessions: e.target.value,
                                            end_date: calculateEndDate(addFormData.start_date, e.target.value)
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        required
                                        placeholder="Số buổi học"
                                    />
                                    <input
                                        type="text"
                                        value={addFormData.end_date ? format(new Date(addFormData.end_date), 'dd/MM/yyyy') : ''}
                                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                        readOnly
                                    />
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                                    >
                                        Thêm
                                    </button>
                                </form>
                            </ModalCustom>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Tìm kiếm lớp học phần ${viewMode === 'unassigned' ? 'chưa phân công' : ''}...`}
                        className="w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400"
                    />
                </div>

                {loading ? (
                    <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
                ) : filteredClassrooms.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">Không có lớp học phần nào {viewMode === 'unassigned' ? 'chưa được phân công' : ''} để hiển thị.</div>
                ) : (
                    <>
                        <ClassroomTable classrooms={paginatedClassrooms} columns={columns} actions={actions} onActionClick={handleActionClick} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}

                {viewMode === 'unassigned' && (
                    <ModalCustom title="Phân Công Giảng Viên" open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                        <form onSubmit={handleAssignTeacher} className="space-y-4 mt-4">
                            <select
                                value={assignFormData.user_id}
                                onChange={(e) => setAssignFormData({ ...assignFormData, user_id: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                required
                            >
                                <option value="">Chọn giảng viên</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.user_id} value={teacher.user_id}>{teacher.fullname || teacher.username}</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                            >
                                Phân Công
                            </button>
                        </form>
                    </ModalCustom>
                )}

                <ModalCustom title="Chỉnh Sửa Lớp Học Phần" open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <form onSubmit={handleUpdate} className="space-y-6 mt-6">
                        <select
                            value={editFormData.class_id}
                            onChange={(e) => setEditFormData({ ...editFormData, class_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn lớp</option>
                            {classes.map((cls) => (
                                <option key={cls.class_id} value={cls.class_id}>{cls.class_name}</option>
                            ))}
                        </select>
                        <select
                            value={editFormData.course_id}
                            onChange={(e) => setEditFormData({ ...editFormData, course_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn khóa học</option>
                            {courses.map((course) => (
                                <option key={course.course_id} value={course.course_id}>{course.course_name}</option>
                            ))}
                        </select>
                        <select
                            value={editFormData.status_id}
                            onChange={(e) => setEditFormData({ ...editFormData, status_id: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn trạng thái</option>
                            {statuses.map((status) => (
                                <option key={status.status_id} value={status.status_id}>{status.status_name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <DatePicker
                                selected={editFormData.start_date}
                                onChange={(date) => setEditFormData({
                                    ...editFormData,
                                    start_date: date ? format(date, 'yyyy-MM-dd') : '',
                                    end_date: calculateEndDate(date, editFormData.numberOfSessions)
                                })}
                                dateFormat="dd/MM/yyyy"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                locale="vi"
                                minDate={today}
                                required
                                popperPlacement="top-start"
                                popperModifiers={[
                                    {
                                        name: 'offset',
                                        options: {
                                            offset: [0, 8],
                                        },
                                    },
                                    {
                                        name: 'preventOverflow',
                                        options: {
                                            rootBoundary: 'document',
                                            tether: true,
                                            altAxis: true,
                                        },
                                    },
                                    {
                                        name: 'flip',
                                        options: {
                                            fallbackPlacements: ['top-start', 'bottom-start'],
                                        },
                                    },
                                ]}
                            />
                        </div>
                        <input
                            type="number"
                            min="1"
                            value={editFormData.numberOfSessions}
                            onChange={(e) => setEditFormData({
                                ...editFormData,
                                numberOfSessions: e.target.value,
                                end_date: calculateEndDate(editFormData.start_date, e.target.value)
                            })}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                            placeholder="Số buổi học"
                        />
                        <input
                            type="text"
                            value={editFormData.end_date ? format(new Date(editFormData.end_date), 'dd/MM/yyyy') : ''}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                            readOnly
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                        >
                            Cập Nhật
                        </button>
                    </form>
                </ModalCustom>

                <ModalCustom title="Xác Nhận Xóa" open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <div className="space-y-6 p-4">
                        <p className="text-gray-600 text-center font-medium">Bạn có chắc chắn muốn xóa lớp học phần này?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600"
                            >
                                Xác Nhận Xóa
                            </button>
                        </div>
                    </div>
                </ModalCustom>

                <ToastContainer limit={1} position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="light" className="mt-4 sm:mt-6" />
            </div>
        </div>
    );
};

export default UnAssigmentManager;
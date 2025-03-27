import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalCustom } from '../../components/admin/ui/ModalCustom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheck, FaTimes, FaInfoCircle, FaEye, FaSearch } from 'react-icons/fa';
import { format, isWithinInterval, parse, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import AssignedClassService from '../../services/assignedClass';
import NotificationService from '../../services/notificationService';

// Định nghĩa tên ngày trong tuần (1-7: Chủ Nhật - Thứ Bảy)
const daysOfWeek = [
    'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
];

const AssignedCourse = () => {
    const [availableCourses, setAvailableCourses] = useState([]);
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const entitiesPerPage = 5;

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    useEffect(() => {
        const fetchCourses = async () => {
            if (!userId) {
                toast.error('Vui lòng đăng nhập để tiếp tục');
                navigate('/login');
                return;
            }

            try {
                const availableClasses = await AssignedClassService.getAvailableClasses();
                const registeredClasses = await AssignedClassService.getRegisteredClasses();
                setAvailableCourses(availableClasses);
                setRegisteredCourses(registeredClasses);
                setLoading(false);
            } catch (error) {
                toast.error(`Lỗi: ${error.message}`);
                setLoading(false);
            }
        };

        fetchCourses();
    }, [navigate, userId]);

    // Hàm kiểm tra xung đột lịch học
    const hasScheduleConflict = (newCourse, registeredCourses) => {
        if (!newCourse.schedules || !newCourse.schedules.length) return false;

        return registeredCourses.some((regCourse) => {
            if (!regCourse.schedules || !regCourse.schedules.length) return false;

            return newCourse.schedules.some((newSchedule) => {
                const newDate = newSchedule.date ? parse(newSchedule.date, 'yyyy-MM-dd', new Date()) : null;
                const newStartTime = parse(newSchedule.start_time, 'HH:mm:ss', new Date());
                const newEndTime = parse(newSchedule.end_time, 'HH:mm:ss', new Date());

                const newDays = newSchedule.weekdays ? [parseInt(newSchedule.weekdays)] : [];
                const newStartDate = newDays.length ? new Date(newCourse.start_date) : newDate;
                const newEndDate = newDays.length ? new Date(newCourse.end_date) : newDate;

                const newCourseDays = [];
                if (newDays.length) {
                    let currentDate = newStartDate;
                    while (currentDate <= newEndDate) {
                        if (newDays.includes(currentDate.getDay() + 1)) {
                            newCourseDays.push(new Date(currentDate));
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                } else {
                    newCourseDays.push(newDate);
                }

                return regCourse.schedules.some((regSchedule) => {
                    const regDate = regSchedule.date ? parse(regSchedule.date, 'yyyy-MM-dd', new Date()) : null;
                    const regStartTime = parse(regSchedule.start_time, 'HH:mm:ss', new Date());
                    const regEndTime = parse(regSchedule.end_time, 'HH:mm:ss', new Date());

                    const regDays = regSchedule.weekdays ? [parseInt(regSchedule.weekdays)] : [];
                    const regStartDate = regDays.length ? new Date(regCourse.start_date) : regDate;
                    const regEndDate = regDays.length ? new Date(regCourse.end_date) : regDate;

                    const regCourseDays = [];
                    if (regDays.length) {
                        let currentDate = regStartDate;
                        while (currentDate <= regEndDate) {
                            if (regDays.includes(currentDate.getDay() + 1)) {
                                regCourseDays.push(new Date(currentDate));
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                        }
                    } else {
                        regCourseDays.push(regDate);
                    }

                    return newCourseDays.some((newDay) => {
                        return regCourseDays.some((regDay) => {
                            if (format(newDay, 'yyyy-MM-dd') !== format(regDay, 'yyyy-MM-dd')) return false;

                            const newStart = new Date(newDay);
                            newStart.setHours(newStartTime.getHours(), newStartTime.getMinutes(), 0);
                            const newEnd = new Date(newDay);
                            newEnd.setHours(newEndTime.getHours(), newEndTime.getMinutes(), 0);

                            const regStart = new Date(regDay);
                            regStart.setHours(regStartTime.getHours(), regStartTime.getMinutes(), 0);
                            const regEnd = new Date(regDay);
                            regEnd.setHours(regEndTime.getHours(), regEndTime.getMinutes(), 0);

                            return (
                                isWithinInterval(newStart, { start: regStart, end: regEnd }) ||
                                isWithinInterval(newEnd, { start: regStart, end: regEnd }) ||
                                isWithinInterval(regStart, { start: newStart, end: newEnd })
                            );
                        });
                    });
                });
            });
        });
    };

    // Lọc danh sách học phần có thể đăng ký
    const filteredCourses = useMemo(() => {
        const registeredCourseIds = registeredCourses.map((reg) => reg.course_id);
        return availableCourses.filter((course) =>
            (course.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
            !registeredCourseIds.includes(course.course_id)
        );
    }, [availableCourses, registeredCourses, searchTerm]);

    const paginatedCourses = filteredCourses.slice((currentPage - 1) * entitiesPerPage, currentPage * entitiesPerPage);
    const totalPages = Math.ceil(filteredCourses.length / entitiesPerPage);

    const handleRegisterCourse = async () => {
        if (!selectedCourse) return;

        if (hasScheduleConflict(selectedCourse, registeredCourses)) {
            toast.error('Xung đột giờ học! Vui lòng chọn học phần khác.');
            return;
        }

        try {
            // Đăng ký khóa học
            await AssignedClassService.registerClass(selectedCourse.classroom_id);

            // Cập nhật dữ liệu local
            const updatedCourse = {
                ...selectedCourse,
                current_enrollment: (selectedCourse.current_enrollment || 0) + 1,
            };
            setRegisteredCourses([...registeredCourses, updatedCourse]);
            setAvailableCourses(
                availableCourses
                    .filter((c) => c.course_id !== selectedCourse.course_id)
                    .map((c) =>
                        c.classroom_id === selectedCourse.classroom_id
                            ? { ...c, current_enrollment: (c.current_enrollment || 0) + 1 }
                            : c
                    )
            );
            setIsRegisterModalOpen(false);
            const notificationData = {
                message: "sinh viên đã  đăng ký khóa học thành công",
                classroom_id: selectedCourse.classroom_id,
                notificationType: "classroom",
            };

            await NotificationService.sendNotificationToClassroomTeachers(notificationData);
            toast.success('Đăng ký khóa học thành công!');
        } catch (error) {
            if (error.response.status === 400) {
                toast.warning(error.response.data.message);
                setIsRegisterModalOpen(false);
            } else {
                toast.error(`Đăng ký học phần thất bại: ${error.message}`);
            }
        }
    };
    const handleCancelRegistration = async (classroomId) => {
        try {
            const enrollment = registeredCourses.find((c) => c.classroom_id === classroomId);
            if (!enrollment) {
                toast.error('Không tìm thấy khóa học đã đăng ký với classroomId: ' + classroomId);
                return;
            }

            const restrictedStatuses = ['Bắt Đầu Học', 'Khóa Đăng Ký', 'Kết Thúc'];
            if (restrictedStatuses.includes(enrollment.status)) {
                toast.error('Không thể hủy đăng ký học phần do trạng thái hiện tại là: ' + enrollment.status);
                return;
            }

            await AssignedClassService.unregisterClass(classroomId);

            const updatedEnrollment = {
                ...enrollment,
                current_enrollment: (enrollment.current_enrollment || 0) - 1,
            };
            setRegisteredCourses(registeredCourses.filter((c) => c.classroom_id !== classroomId));
            setAvailableCourses(
                availableCourses
                    .map((c) =>
                        c.classroom_id === classroomId
                            ? { ...c, current_enrollment: (c.current_enrollment || 0) - 1 }
                            : c
                    )
                    .concat(updatedEnrollment)
            );

            const notificationData = {
                message: "sinh viên đã hủy đăng ký khóa học",
                classroom_id: classroomId, // Sửa ở đây
                notificationType: "classroom",
            };
            await NotificationService.sendNotificationToClassroomTeachers(notificationData);

            toast.success('Hủy đăng ký thành công!');
        } catch (error) {
            toast.error(`Hủy đăng ký thất bại: ${error.message}`);
        }
    };
    const columns = [
        { label: 'Mã Lớp', key: 'classroom_id', render: (c) => c.classroom_id || 'N/A' },
        { label: 'Tên Lớp', key: 'class_name', render: (c) => c.class_name || 'Không xác định' },
        {
            label: 'Tên Học Phần',
            key: 'course_name',
            render: (c) => `${c.course_code || 'N/A'} - ${c.course_name || 'Không xác định'}`,
        },
        {
            label: 'Ngày Bắt Đầu',
            key: 'start_date',
            render: (c) => (c.start_date ? format(parseISO(c.start_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'),
        },
        {
            label: 'Ngày Kết Thúc',
            key: 'end_date',
            render: (c) => (c.end_date ? format(parseISO(c.end_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'),
        },
        {
            label: 'Sĩ Số',
            key: 'enrollment',
            render: (c) => `${c.current_enrollment || 0}/${c.max_capacity || 'N/A'}`,
        },
        { label: 'Trạng Thái', key: 'status', render: (c) => c.status || 'Không xác định' },
        {
            label: 'Hành Động',
            key: 'action',
            render: (c) => (
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setSelectedCourse(c);
                            setIsDetailModalOpen(true);
                        }}
                        className="bg-gradient-to-r p-2 rounded-full shadow-md text-white duration-300 from-blue-500 hover:from-blue-600 hover:scale-105 hover:to-blue-500 to-blue-400 transform transition-all"
                        title="Xem chi tiết"
                    >
                        <FaEye size={16} />
                    </button>
                    {c.status === 'Mở Đăng Ký' ? (
                        <button
                            onClick={() => {
                                setSelectedCourse(c);
                                setIsRegisterModalOpen(true);
                            }}
                            className="bg-gradient-to-r p-2 rounded-full shadow-md text-white duration-300 from-green-500 hover:from-green-600 hover:scale-105 hover:to-green-500 to-green-400 transform transition-all"
                            title="Đăng ký"
                        >
                            <FaCheck size={16} />
                        </button>
                    ) : (
                        <span className="p-2 text-gray-400">
                            <FaInfoCircle size={16} title="Không thể đăng ký" />
                        </span>
                    )}
                </div>
            ),
        },
    ];

    const registeredColumns = [
        { label: 'Mã Lớp', key: 'classroom_id', render: (c) => c.classroom_id || 'N/A' },
        { label: 'Tên Lớp', key: 'class_name', render: (c) => c.class_name || 'Không xác định' },
        {
            label: 'Tên Học Phần',
            key: 'course_name',
            render: (c) => `${c.course_code || 'N/A'} - ${c.course_name || 'Không xác định'}`,
        },
        {
            label: 'Ngày Bắt Đầu',
            key: 'start_date',
            render: (c) => (c.start_date ? format(parseISO(c.start_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'),
        },
        {
            label: 'Ngày Kết Thúc',
            key: 'end_date',
            render: (c) => (c.end_date ? format(parseISO(c.end_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'),
        },
        {
            label: 'Sĩ Số',
            key: 'enrollment',
            render: (c) => `${c.current_enrollment || 0}/${c.max_capacity || 'N/A'}`,
        },
        {
            label: 'Hành Động',
            key: 'action',
            render: (c) => {
                const restrictedStatuses = ['Bắt Đầu Học', 'Khóa Đăng Ký', 'Kết Thúc'];
                const canCancel = !restrictedStatuses.includes(c.status);

                return (
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setSelectedCourse(c);
                                setIsDetailModalOpen(true);
                            }}
                            className="bg-gradient-to-r p-2 rounded-full shadow-md text-white duration-300 from-blue-500 hover:from-blue-600 hover:scale-105 hover:to-blue-500 to-blue-400 transform transition-all"
                            title="Xem chi tiết"
                        >
                            <FaEye size={16} />
                        </button>
                        {canCancel ? (
                            <button
                                onClick={() => handleCancelRegistration(c.classroom_id)}
                                className="bg-gradient-to-r p-2 rounded-full shadow-md text-white duration-300 from-red-500 hover:from-red-600 hover:scale-105 hover:to-red-500 to-red-400 transform transition-all"
                                title="Hủy đăng ký"
                            >
                                <FaTimes size={16} />
                            </button>
                        ) : (
                            <span className="p-2 text-gray-400">
                                <FaInfoCircle size={16} title="Không thể hủy đăng ký" />
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];

    const Pagination = ({ currentPage, totalPages, onPageChange }) => (
        <div className="flex justify-center items-center mt-8 space-x-3">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gradient-to-r rounded-full shadow-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 duration-300 from-gray-200 hover:from-gray-300 hover:to-gray-200 px-5 py-2 to-gray-100 transition-all"
            >
                Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-5 py-2 rounded-full transition-all duration-300 shadow-sm ${currentPage === page
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white'
                        : 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 hover:from-gray-300 hover:to-gray-200'
                        }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gradient-to-r rounded-full shadow-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 duration-300 from-gray-200 hover:from-gray-300 hover:to-gray-200 px-5 py-2 to-gray-100 transition-all"
            >
                Sau
            </button>
        </div>
    );

    return (
        <div className="bg-gradient-to-br p-6 from-gray-50 lg:p-10 min-h-screen pb-20 mt-20 to-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col justify-center text-center gap-4 items-center sm:flex-row">
                    <h2 className="bg-clip-text bg-gradient-to-r h-20 text-4xl text-center text-gray-800 text-transparent font-extrabold from-blue-600 lg:text-5xl to-blue-400 tracking-tight">
                        Đăng Ký Học Phần
                    </h2>
                </div>

                <div className="mb-8 relative">
                    <div className="flex absolute inset-y-0 items-center left-0 pl-4 pointer-events-none">
                        <FaSearch className="text-gray-400" size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm học phần..."
                        className="bg-white border border-gray-200 rounded-2xl shadow-md text-gray-700 w-full duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pl-12 placeholder-gray-400 pr-4 py-4 transition-all"
                    />
                </div>

                {loading ? (
                    <div className="flex h-64 justify-center text-center text-gray-600 items-center">
                        <svg
                            className="h-12 text-blue-500 w-12 animate-spin mr-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"></path>
                        </svg>
                        <span className="text-gray-700 text-lg">Đang tải dữ liệu...</span>
                    </div>
                ) : (
                    <>
                        <h3 className="text-2xl text-gray-800 font-semibold mb-6">Học Phần Có Thể Đăng Ký</h3>
                        {filteredCourses.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl shadow-md text-center text-gray-500">
                                Không có học phần nào để đăng ký.
                            </div>
                        ) : (
                            <>
                                <div className="rounded-2xl shadow-md overflow-x-auto">
                                    <table className="bg-white border border-gray-200 rounded-2xl min-w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r text-white from-blue-500 to-blue-400">
                                                {columns.map((col, index) => (
                                                    <th
                                                        key={index}
                                                        className={`px-6 py-4 text-left text-sm font-semibold ${index === 0 ? 'rounded-tl-2xl' : ''
                                                            } ${index === columns.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                                    >
                                                        {col.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedCourses.map((course, index) => (
                                                <tr
                                                    key={index}
                                                    className={`border-b transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                        } hover:bg-blue-50`}
                                                >
                                                    {columns.map((col, colIndex) => (
                                                        <td key={colIndex} className="text-gray-800 text-sm px-6 py-4">
                                                            {col.render ? col.render(course) : course[col.key]}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </>
                        )}

                        <h3 className="text-2xl text-gray-800 font-semibold mb-6 mt-12">Học Phần Đã Đăng Ký</h3>
                        {registeredCourses.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl shadow-md text-center text-gray-500">
                                Bạn chưa đăng ký học phần nào.
                            </div>
                        ) : (
                            <div className="rounded-2xl shadow-md overflow-x-auto">
                                <table className="bg-white border border-gray-200 rounded-2xl min-w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r text-white from-blue-500 to-blue-400">
                                            {registeredColumns.map((col, index) => (
                                                <th
                                                    key={index}
                                                    className={`px-6 py-4 text-left text-sm font-semibold ${index === 0 ? 'rounded-tl-2xl' : ''
                                                        } ${index === registeredColumns.length - 1 ? 'rounded-tr-2xl' : ''}`}
                                                >
                                                    {col.label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registeredCourses.map((course, index) => (
                                            <tr
                                                key={index}
                                                className={`border-b transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                    } hover:bg-blue-50`}
                                            >
                                                {registeredColumns.map((col, colIndex) => (
                                                    <td key={colIndex} className="text-gray-800 text-sm px-6 py-4">
                                                        {col.render ? col.render(course) : course[col.key]}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Modal Xác Nhận Đăng Ký */}
                <ModalCustom
                    title="Xác Nhận Đăng Ký Học Phần"
                    open={isRegisterModalOpen}
                    onOpenChange={setIsRegisterModalOpen}
                    className="bg-gradient-to-br border border-gray-100 rounded-3xl shadow-2xl duration-300 from-white max-w-[500px] min-w-[400px] to-gray-50 transition-all"
                >
                    <div className="p-8 relative space-y-6">
                        {/* Nội dung chính */}
                        {selectedCourse && (
                            <div className="space-y-5">
                                {/* Câu hỏi xác nhận */}
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
                                    <p className="text-base text-gray-800 leading-relaxed">
                                        Bạn có muốn đăng ký học phần{' '}
                                        <strong className="text-blue-600">{`${selectedCourse.course_code || 'N/A'} - ${selectedCourse.course_name || 'Không xác định'}`}</strong> không?
                                    </p>
                                </div>

                                {/* Thông tin chi tiết */}
                                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 font-medium">Tên lớp:</span>
                                        <span className="text-gray-800">{selectedCourse.class_name || 'Không xác định'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 font-medium">Ngày bắt đầu:</span>
                                        <span className="text-gray-800">
                                            {selectedCourse.start_date ? format(parseISO(selectedCourse.start_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 font-medium">Ngày kết thúc:</span>
                                        <span className="text-gray-800">
                                            {selectedCourse.end_date ? format(parseISO(selectedCourse.end_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-gray-500 font-medium">Sĩ số:</span>
                                        <span className="text-gray-800">{selectedCourse.current_enrollment || 0}/{selectedCourse.max_capacity || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Nút hành động */}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setIsRegisterModalOpen(false)}
                                        className="bg-gradient-to-r rounded-xl shadow-md text-gray-700 duration-300 from-gray-300 hover:-translate-y-0.5 hover:from-gray-400 hover:shadow-lg hover:to-gray-300 px-6 py-2.5 to-gray-200 transform transition-all"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleRegisterCourse}
                                        className="flex bg-gradient-to-r rounded-xl shadow-md text-white duration-300 from-blue-600 hover:-translate-y-0.5 hover:from-blue-700 hover:shadow-lg hover:to-blue-600 items-center px-6 py-2.5 space-x-2 to-blue-500 transform transition-all"
                                    >
                                        <FaCheck size={16} />
                                        <span>Xác Nhận</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalCustom>
                {/* Modal Xem Chi Tiết */}
                <ModalCustom
                    title="Chi Tiết Học Phần"
                    open={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    className="bg-white rounded-2xl shadow-xl max-w-[600px] min-w-[400px]"
                >
                    <div className="p-6 space-y-6">
                        {selectedCourse && (
                            <div className="text-gray-700 text-sm space-y-4">
                                <p><strong>Mã Lớp:</strong> {selectedCourse.classroom_id || 'N/A'}</p>
                                <p><strong>Tên Lớp:</strong> {selectedCourse.class_name || 'Không xác định'}</p>
                                <p><strong>Học Phần:</strong> {`${selectedCourse.course_code || 'N/A'} - ${selectedCourse.course_name || 'Không xác định'}`}</p>
                                <p><strong>Ngày Bắt Đầu:</strong> {selectedCourse.start_date ? format(parseISO(selectedCourse.start_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}</p>
                                <p><strong>Ngày Kết Thúc:</strong> {selectedCourse.end_date ? format(parseISO(selectedCourse.end_date), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}</p>
                                <p><strong>Sĩ Số:</strong> {selectedCourse.current_enrollment || 0}/{selectedCourse.max_capacity || 'N/A'}</p>
                                <p><strong>Trạng Thái:</strong> {selectedCourse.status || 'Không xác định'}</p>
                                <div>
                                    <strong className="text-gray-800">Lịch Học:</strong>
                                    {selectedCourse.schedules && selectedCourse.schedules.length > 0 ? (
                                        <div className="rounded-xl shadow-md mt-4 overflow-x-auto">
                                            <table className="bg-white border border-gray-200 rounded-xl min-w-full">
                                                <thead>
                                                    <tr className="bg-gradient-to-r text-white from-blue-500 to-blue-400">
                                                        <th className="rounded-tl-xl text-left text-sm font-semibold px-6 py-3">Ngày</th>
                                                        <th className="text-left text-sm font-semibold px-6 py-3">Thời Gian</th>
                                                        <th className="rounded-tr-xl text-left text-sm font-semibold px-6 py-3">Loại Lịch</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedCourse.schedules
                                                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                                                        .map((schedule, index) => {
                                                            const scheduleDate = schedule.date ? parse(schedule.date, 'yyyy-MM-dd', new Date()) : null;
                                                            const dayOfWeek = scheduleDate ? format(scheduleDate, 'EEEE', { locale: vi }) : 'N/A';
                                                            const formattedDate = scheduleDate ? format(scheduleDate, 'dd/MM/yyyy', { locale: vi }) : 'N/A';
                                                            const eventType = schedule.exam_date && schedule.exam_date === schedule.date ? 'Thi' : 'Học lý thuyết';

                                                            return (
                                                                <tr
                                                                    key={index}
                                                                    className={`border-b transition-all duration-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                                        } hover:bg-blue-50`}
                                                                >
                                                                    <td className="text-gray-800 text-sm px-6 py-4">
                                                                        {scheduleDate ? `${dayOfWeek}, ${formattedDate}` : 'N/A'}
                                                                    </td>
                                                                    <td className="text-gray-800 text-sm px-6 py-4">
                                                                        {schedule.start_time && schedule.end_time
                                                                            ? `${format(parse(schedule.start_time, 'HH:mm:ss', new Date()), 'HH:mm', { locale: vi })} - 
                                                                                ${format(parse(schedule.end_time, 'HH:mm:ss', new Date()), 'HH:mm', { locale: vi })}`
                                                                            : 'N/A'}
                                                                    </td>
                                                                    <td className="text-gray-800 text-sm px-6 py-4">{eventType}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 text-sm mt-2">Không có lịch học</p>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="bg-gradient-to-r rounded-lg shadow-sm text-gray-700 duration-300 from-gray-200 hover:from-gray-300 hover:to-gray-200 px-5 py-2 to-gray-100 transition-all"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalCustom>
            </div>
        </div>
    );
};

export default AssignedCourse;
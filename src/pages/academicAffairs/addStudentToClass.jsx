import React, { useState, useMemo, useEffect } from 'react';
import { ModalCustom } from '../../components/admin/ui/ModalCustom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus, FaFileExcel, FaTrash, FaEye } from 'react-icons/fa';
import useClassroomData from '../../hooks/useClassroomData';
import ClassroomTable from '../../components/admin/ClassroomTable';
import Pagination from '../../components/admin/Pagination';
import {
    getStudentsByClassroom,
    addStudentToClassroom,
    importStudentsToClassroom,
} from '../../services/classRoomServices';
import { useNavigate } from 'react-router-dom';

const AddStudentToClass = () => {
    const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [isImportStudentsOpen, setIsImportStudentsOpen] = useState(false);
    const [currentClassroom, setCurrentClassroom] = useState(null);
    const [currentClassroomStudents, setCurrentClassroomStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [addStudentFormData, setAddStudentFormData] = useState({ student_id: '' });
    const [importFile, setImportFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { classrooms, students, loading, fetchData } = useClassroomData('assigned');
    const entitiesPerPage = 6;
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Thêm Sinh Viên Vào Lớp Học Phần';
    }, []);

    const filteredClassrooms = useMemo(() => {
        if (!Array.isArray(classrooms)) return [];
        return classrooms.filter((c) =>
            Object.values(c).some((val) => String(val || '').toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [classrooms, searchTerm]);

    const paginatedClassrooms = filteredClassrooms.slice((currentPage - 1) * entitiesPerPage, currentPage * entitiesPerPage);
    const totalPages = Math.ceil(filteredClassrooms.length / entitiesPerPage);

    const fetchClassroomStudents = async (classroomId) => {
        try {
            const students = await getStudentsByClassroom(classroomId);
            setCurrentClassroomStudents(Array.isArray(students) ? students : []);
            setIsViewStudentsOpen(true);
        } catch (error) {
            toast.warning('Không thể lấy danh sách sinh viên!');
            setCurrentClassroomStudents([]);
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!addStudentFormData.student_id) return toast.error('Vui lòng chọn sinh viên!');

        try {
            console.log('Student ID trước khi gửi:', addStudentFormData.student_id);

            const studentId = parseInt(addStudentFormData.student_id, 10);
            if (isNaN(studentId)) {
                throw { status: 400, message: 'ID sinh viên không hợp lệ! Vui lòng kiểm tra dữ liệu sinh viên.' };
            }

            await addStudentToClassroom(currentClassroom.classroom_id, studentId);
            fetchClassroomStudents(currentClassroom.classroom_id);
            fetchData();
            setIsAddStudentOpen(false);
            setAddStudentFormData({ student_id: '' });
            toast.success('Thêm sinh viên thành công!');
        } catch (error) {
            console.error('Lỗi khi thêm sinh viên:', error);

            if (error.status === 400) {
                toast.warning(error.message);
            } else {
                toast.error(error.message || 'Lỗi không xác định khi thêm sinh viên!');
            }
        }
    };



    const handleImportStudents = async (e) => {
        e.preventDefault();
        if (!importFile) return toast.error('Vui lòng chọn file Excel!');
        setIsUploading(true);
        try {
            await importStudentsToClassroom(currentClassroom.classroom_id, importFile);
            fetchClassroomStudents(currentClassroom.classroom_id);
            fetchData();
            setIsImportStudentsOpen(false);
            setImportFile(null);
            toast.success('Nhập danh sách sinh viên thành công!');
        } catch (error) {
            toast.error(error.message || 'Lỗi khi nhập danh sách sinh viên!');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
            setImportFile(file);
        } else {
            toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)!');
            setImportFile(null);
        }
    };

    const handleRemoveFile = () => {
        setImportFile(null);
    };

    const columns = [
        { label: 'ID', key: 'classroom_id', render: (c) => c.classroom_id || 'N/A' },
        {
            label: 'Tên Khóa Học',
            key: 'course_id',
            render: (c) => c.Course ? `${c.Class.class_name} - ${c.Course.course_name}` : 'Chưa có'
        },
        { label: 'Số Lượng Sinh Viên', key: 'student_count', render: (c) => c.student_count || 0 },
        { label: 'Giảng Viên', key: 'assignedTeacherName', render: (c) => c.assignedTeacherName || 'Chưa phân công' },
    ];

    const actions = [
        { type: 'viewStudents', icon: <FaEye size={16} />, className: 'p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-300 transform hover:scale-110', title: 'Xem danh sách sinh viên' },
        { type: 'addStudent', icon: <FaUserPlus size={16} />, className: 'p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-all duration-300 transform hover:scale-110', title: 'Thêm sinh viên' },
        { type: 'importStudents', icon: <FaFileExcel size={16} />, className: 'p-2 bg-yellow-100 text-yellow-600 rounded-full hover:bg-yellow-200 transition-all duration-300 transform hover:scale-110', title: 'Nhập sinh viên từ Excel' },
    ];

    const handleActionClick = (type, classroom) => {
        setCurrentClassroom(classroom);
        if (type === 'viewStudents') {
            fetchClassroomStudents(classroom.classroom_id);
        } else if (type === 'addStudent') {
            setAddStudentFormData({ student_id: '' });
            setIsAddStudentOpen(true);
        } else if (type === 'importStudents') {
            setImportFile(null);
            setIsImportStudentsOpen(true);
        }
    };

    // Lọc danh sách sinh viên chưa có trong lớp
    const availableStudents = useMemo(() => {
        if (!Array.isArray(students) || !Array.isArray(currentClassroomStudents)) return [];
        const currentStudentIds = new Set(currentClassroomStudents.map((student) => student.id));
        const filteredStudents = students.filter((student) => !currentStudentIds.has(student.id));

        // Debug dữ liệu availableStudents
        console.log('Available Students:', filteredStudents);

        return filteredStudents;
    }, [students, currentClassroomStudents]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
            <nav className="mb-6">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    <li>
                        <button
                            onClick={() => navigate('/eduAffair')}
                            className="hover:text-teal-600 transition-colors duration-200"
                        >
                            Trang chủ
                        </button>
                    </li>
                    <li>
                        <span className="mx-1">/</span>
                        <button
                            onClick={() => navigate('/eduAffair/manager-assign')}
                            className="hover:text-teal-600 transition-colors duration-200"
                        >
                            Giảng dạy và phân công
                        </button>
                    </li>
                    <li>
                        <span className="mx-1">/</span>
                        <span className="text-teal-600 font-medium">
                            Thêm sinh viên vào lớp học phần
                        </span>
                    </li>
                </ol>
            </nav>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col mt-12 sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-600 tracking-tight text-center sm:text-left">
                        Thêm sinh viên vào lớp học phần
                    </h2>
                </div>
                <style>
                    {`
                    .file-upload-container {
                        border: 2px dashed #d1d5db;
                        border-radius: 0.5rem;
                        padding: 1.5rem;
                        text-align: center;
                        background-color: #f9fafb;
                        transition: all 0.3s ease;
                    }
                    .file-upload-container:hover {
                        border-color: #3b82f6;
                        background-color: #f0f4ff;
                    }
                    .file-upload-container.dragover {
                        border-color: #3b82f6;
                        background-color: #e0e7ff;
                    }
                    .file-upload-label {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.5rem;
                        cursor: pointer;
                        color: #6b7280;
                    }
                    .file-upload-label svg {
                        font-size: 2rem;
                        color: #3b82f6;
                    }
                    .file-upload-label span {
                        font-size: 0.875rem;
                        color: #3b82f6;
                        text-decoration: underline;
                    }
                    .file-preview {
                        margin-top: 1rem;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        background-color: #e5e7eb;
                        padding: 0.5rem 1rem;
                        border-radius: 0.5rem;
                    }
                    .file-preview span {
                        font-size: 0.875rem;
                        color: #374151;
                    }
                    .file-preview button {
                        background: none;
                        border: none;
                        color: #ef4444;
                        cursor: pointer;
                        transition: color 0.3s ease;
                    }
                    .file-preview button:hover {
                        color: #dc2626;
                    }
                    .modal-content {
                        min-height: 350px;
                    }
                    @media (max-width: 640px) {
                        .min-w-[450px] {
                            min-width: 90vw;
                            max-width: 90vw;
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

                <ModalCustom
                    title="Danh Sách Sinh Viên"
                    open={isViewStudentsOpen}
                    onOpenChange={setIsViewStudentsOpen}
                    className="min-w-[450px] max-w-[600px] min-h-[500px] bg-white rounded-lg shadow-lg"
                >
                    <div className="space-y-6 mt-6 p-6">
                        <div className="flex justify-end space-x-2 mb-4">
                            <button
                                onClick={() => setIsAddStudentOpen(true)}
                                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
                            >
                                <FaUserPlus size={16} className="inline mr-2" />
                                Thêm Sinh Viên
                            </button>
                            <button
                                onClick={() => setIsImportStudentsOpen(true)}
                                className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-300"
                            >
                                <FaFileExcel size={16} className="inline mr-2" />
                                Nhập Từ Excel
                            </button>
                        </div>
                        {currentClassroomStudents.length > 0 ? (
                            <div className="max-h-96 overflow-y-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Mã Sinh Viên</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Họ và Tên</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentClassroomStudents.map((student) => (
                                            <tr key={student.id} className="border-b">
                                                <td className="px-4 py-2 text-sm text-gray-700">{student.id || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-700">{student.student_code || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-700">{student.fullname || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-700">{student.email || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Chưa có sinh viên nào trong lớp học phần này.</p>
                        )}
                    </div>
                </ModalCustom>

                <ModalCustom title="Thêm Sinh Viên" open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                    <form onSubmit={handleAddStudent} className="space-y-4 mt-4">
                        <select
                            value={addStudentFormData.student_id}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                console.log('Giá trị được chọn:', selectedValue);
                                // Kiểm tra xem giá trị có phải là số không
                                if (!isNaN(parseInt(selectedValue, 10))) {
                                    setAddStudentFormData({ ...addStudentFormData, student_id: selectedValue });
                                } else {
                                    toast.error('Giá trị ID sinh viên không hợp lệ!');
                                }
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            required
                        >
                            <option value="">Chọn sinh viên</option>
                            {availableStudents.length > 0 ? (
                                availableStudents.map((student) => (
                                    <option key={student.username} value={student.username}>
                                        {student.fullname || 'N/A'} (Mã SV: {student.username || 'N/A'})
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Không có sinh viên nào để thêm</option>
                            )}
                        </select>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-900"
                        >
                            Thêm Sinh Viên
                        </button>
                    </form>
                </ModalCustom>

                <ModalCustom
                    title="Nhập Sinh Viên Từ File Excel"
                    open={isImportStudentsOpen}
                    onOpenChange={(open) => {
                        setIsImportStudentsOpen(open);
                        if (!open) {
                            setImportFile(null);
                            setIsUploading(false);
                        }
                    }}
                >
                    <form onSubmit={handleImportStudents} className="space-y-6 mt-6">
                        <div
                            className="file-upload-container"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('dragover');
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('dragover');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('dragover');
                                const file = e.dataTransfer.files[0];
                                if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
                                    setImportFile(file);
                                } else {
                                    toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)!');
                                }
                            }}
                        >
                            <label className="file-upload-label">
                                <FaFileExcel />
                                <p>Kéo và thả file Excel tại đây</p>
                                <span>hoặc nhấp để chọn file</span>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                            {importFile && (
                                <div className="file-preview">
                                    <span>{importFile.name}</span>
                                    <button type="button" onClick={handleRemoveFile} disabled={isUploading}>
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
                            disabled={isUploading || !importFile}
                        >
                            {isUploading ? 'Đang nhập file...' : 'Nhập File'}
                        </button>
                    </form>
                </ModalCustom>

                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="light" className="mt-4 sm:mt-6" />
            </div>
        </div>
    );
};

export default AddStudentToClass;
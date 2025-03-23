import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAssignmentsByClassRoom,
  downloadAssignment,
  uploadAssignment,
  updateAssignment,
  getUserParticipationId,
  deleteAssignment,
} from "../../services/assignmentService";
import { toast, ToastContainer } from "react-toastify";
import Submission from "./Submission";
import NotificationService from '../../services/notificationService';
import { ModalCustom } from "../../components/admin/ui/ModalCustom";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal tạo bài tập
  const [editAssignment, setEditAssignment] = useState(null); // Modal chỉnh sửa
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Modal xóa
  const [assignmentToDelete, setAssignmentToDelete] = useState(null); // ID bài tập cần xóa
  const [openAssignmentId, setOpenAssignmentId] = useState(null);
  const { classroomId } = useParams();
  const [userParticipationId, setUserParticipationId] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editFiles, setEditFiles] = useState([]);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [existingFiles, setExistingFiles] = useState([]);
  const [removeFileIndices, setRemoveFileIndices] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state cho tìm kiếm
  const user = JSON.parse(localStorage.getItem("user"));

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    if (user) {
      setUserRole(user.role_id === 2 ? "teacher" : "student");
      setUserId(user.id);
    }
  }, []);

  // Lấy danh sách bài tập và user_participation_id
  useEffect(() => {
    const fetchData = async () => {
      if (!classroomId || !userId) {
        toast.error("Thiếu thông tin classroom hoặc user.");
        setLoading(false);
        return;
      }
      try {
        const participationId = await getUserParticipationId(userId, classroomId);
        setUserParticipationId(participationId);
        const data = await getAssignmentsByClassRoom(classroomId);
        setAssignments(data.assignments || []);
        setLoading(false);
      } catch (err) {
        setAssignments([]);
        setLoading(false);
        toast.error("Lỗi khi tải danh sách bài tập.");
      }
    };
    if (userId && classroomId) fetchData();
  }, [userId, classroomId]);

  // Lọc danh sách bài tập dựa trên searchTerm
  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (assignmentId) => {
    try {
      const { fileUrl, filename } = await downloadAssignment(assignmentId);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error("Lỗi khi tải file.");
    }
  };

  // Xử lý submit tạo bài tập mới
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title || !endDate || !uploadFiles.length) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, deadline và file!");
      return;
    }
    try {
      const response = await uploadAssignment(userParticipationId, userId, uploadFiles, title, description, null, endDate);
      setAssignments((prev) => [...prev, { ...response.assignment, assignment_id: response.assignment.assignment_id || Date.now() }]);
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom",
        message: `Giảng viên ${user.fullname} đã tải lên file bài tập ${title}, vui lòng làm và nộp đúng hạn!`,
      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);
      toast.success("Tạo bài tập thành công!");
      setIsModalOpen(false);
      setUploadFiles([]);
      setTitle("");
      setDescription("");
      setEndDate("");
    } catch (error) {
      toast.error("Lỗi khi tạo bài tập.");
    }
  };

  // Xử lý mở modal chỉnh sửa
  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    setEditTitle(assignment.title || "");
    setEditDescription(assignment.description || "");
    const endDate = assignment.end_assignment
      ? new Date(assignment.end_assignment).toISOString().slice(0, 16)
      : "";
    setEditEndDate(endDate);
    setEditFiles([]);
    let filePaths = [];
    try {
      filePaths = assignment.file_path ? JSON.parse(assignment.file_path) : [];
      if (!Array.isArray(filePaths)) filePaths = [];
    } catch (error) {
      console.error("Lỗi khi parse file_path trong handleEdit:", error);
      filePaths = [];
    }
    setExistingFiles(filePaths);
    setRemoveFileIndices([]);
  };

  // Xử lý submit chỉnh sửa bài tập
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle || !editEndDate) {
      toast.error("Tiêu đề và deadline là bắt buộc!");
      return;
    }
    try {
      const data = { title: editTitle, description: editDescription, endDate: editEndDate };
      const response = await updateAssignment(editAssignment.assignment_id, data, editFiles, removeFileIndices);
      setAssignments((prev) =>
        prev.map((a) =>
          a.assignment_id === editAssignment.assignment_id
            ? { ...a, ...data, file_path: response.assignment.file_path || a.file_path }
            : a
        )
      );
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom",
        message: `Giảng viên ${user.fullname} đã chỉnh sửa bài tập ${title}, vui lòng xem các thay đổi!`,
      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);
      toast.success("Cập nhật bài tập thành công!");
      setEditAssignment(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lỗi khi cập nhật bài tập.";
      toast.error(errorMessage);
    }
  };

  // Xử lý mở modal xóa
  const handleDeleteClick = (assignmentId) => {
    setAssignmentToDelete(assignmentId);
    setDeleteModalOpen(true);
  };

  // Xử lý xác nhận xóa bài tập
  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteAssignment(assignmentToDelete);
      setAssignments((prev) => prev.filter((a) => a.assignment_id !== assignmentToDelete));
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom",
        message: `Giảng viên ${user.fullname} đã xóa file bài tập ${title}`,
      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);
      toast.success("Xóa bài tập thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa bài tập.");
    } finally {
      setDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-teal-500 text-transparent bg-clip-text">
        Danh sách bài tập
      </h1>

      {/* Thanh tìm kiếm và nút tạo bài tập */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm bài tập..."
          className="w-full md:w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {userRole === "teacher" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Tạo bài tập mới
          </button>
        )}
      </div>

      {/* Modal Tạo bài tập */}
      {isModalOpen && (
        <ModalCustom
          title="Tải lên bài tập mới"
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">File bài tập</label>
              <input
                type="file"
                multiple
                onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
              {uploadFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-600">File đã chọn:</p>
                  <ul className="list-disc pl-5">
                    {uploadFiles.map((file, index) => (
                      <li key={index} className="text-gray-600">{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all"
            >
              Tải lên
            </button>
          </form>
        </ModalCustom>
      )}

      {/* Modal Sửa bài tập */}
      {editAssignment && (
        <ModalCustom
          title="Chỉnh sửa bài tập"
          open={!!editAssignment}
          onOpenChange={(open) => !open && setEditAssignment(null)}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">File hiện tại</label>
              {Array.isArray(existingFiles) && existingFiles.length > 0 ? (
                existingFiles.map((filePath, index) =>
                  !removeFileIndices.includes(index) ? (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <span className="text-gray-800 font-medium truncate flex-1">
                        {filePath.split(/[\\/]/).pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveFileIndices((prev) => [...prev, index]);
                          setExistingFiles((prev) => prev.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  ) : null
                )
              ) : (
                <p className="text-gray-500 italic mt-2">Không có file hiện tại</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Thêm file mới (tùy chọn)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setEditFiles(Array.from(e.target.files))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {editFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-gray-600">File mới đã chọn:</p>
                  <ul className="list-disc pl-5">
                    {editFiles.map((file, index) => (
                      <li key={index} className="text-gray-600">{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-all"
            >
              Cập nhật
            </button>
          </form>
        </ModalCustom>
      )}

      {/* Modal Xác nhận xóa */}
      <ModalCustom
        title="Xác nhận xóa bài tập"
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      >
        <div className="text-gray-700">
          <p>Bạn có chắc muốn xóa bài tập này không? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              Xóa
            </button>
          </div>
        </div>
      </ModalCustom>

      {/* Danh sách bài tập */}
      {loading ? (
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="animate-spin w-8 h-8 sm:w-10 sm:h-10 border-4 border-t-transparent border-blue-500 rounded-full"></div>
          <span className="ml-2 text-base sm:text-lg text-gray-600">Đang tải...</span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <p className="text-center text-gray-500 text-lg sm:text-xl py-8 sm:py-12 bg-white rounded-2xl shadow-md">
          Không tìm thấy bài tập nào.
        </p>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {filteredAssignments.map((assignment) => {
            const isPastDue = new Date(assignment.end_assignment) < new Date();
            return (
              <div
                key={assignment.assignment_id}
                className="bg-white p-4 sm:p-6 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div
                  className="flex flex-col sm:flex-row justify-between items-start cursor-pointer"
                  onClick={() =>
                    setOpenAssignmentId(
                      openAssignmentId === assignment.assignment_id ? null : assignment.assignment_id
                    )
                  }
                >
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{assignment.title}</h3>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">
                      {assignment.description || "Không có mô tả"}
                    </p>
                    <p className="text-xs sm:text-sm mt-2 sm:mt-3 flex items-center">
                      <span className="text-gray-500 font-medium">Deadline:</span>
                      <span
                        className={`ml-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${isPastDue ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"
                          }`}
                      >
                        {new Date(assignment.end_assignment).toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:space-x-3 mt-3 sm:mt-0 w-full sm:w-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(assignment.assignment_id);
                      }}
                      className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105 text-sm sm:text-base"
                    >
                      Tải file
                    </button>
                    {userRole === "teacher" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(assignment);
                          }}
                          className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105 text-sm sm:text-base"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(assignment.assignment_id);
                          }}
                          className="px-3 py-1 sm:px-4 sm:py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-md transform hover:scale-105 text-sm sm:text-base"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {openAssignmentId === assignment.assignment_id && (
                  <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-4 sm:pt-6 animate-fade-in">
                    <Submission
                      assignmentId={assignment.assignment_id}
                      userId={userId}
                      userRole={userRole}
                      deadline={assignment.end_assignment}
                      assignmentTitle={assignment.title}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchLectureOnClassroom,
  uploadLecture,
  downloadLecture,
  getUserParticipationId,
  updateLecture,
  deleteLecture,
} from '../../services/LectureService';
import { ModalCustom } from '../../components/admin/ui/ModalCustom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import path from 'path-browserify';

// Import icons
import {
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFile,
  FaEdit,
  FaChevronDown,
  FaChevronUp,
  FaTrash,
  FaPlay,
  FaDownload,
} from 'react-icons/fa';
import NotificationService from '../../services/notificationService';

// Utility functions for file handling
const getCleanFileName = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return 'Không có tên file';
  // Lấy tên file từ đường dẫn bằng cách tách theo dấu phân cách cuối cùng
  const fileName = filePath.split(/[\\/]/).pop(); // Tách theo \ hoặc / và lấy phần cuối
  const cleanName = fileName.replace(/^\d+-/, ''); // Xóa số và dấu - ở đầu
  return cleanName;
};

const getFileIcon = (fileName) => {
  if (!fileName) return <FaFile className="text-gray-500" />;
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case '.pdf':
      return <FaFilePdf className="text-red-500" />;
    case '.pptx':
    case '.ppt':
      return <FaFilePowerpoint className="text-orange-500" />;
    case '.doc':
    case '.docx':
      return <FaFileWord className="text-blue-500" />;
    case '.xlsx':
    case '.xls':
      return <FaFileExcel className="text-green-500" />;
    case '.jpg':
    case '.jpeg':
    case '.png':
      return <FaFileImage className="text-purple-500" />;
    default:
      return <FaFile className="text-gray-500" />;
  }
};

const parseFilePath = (filePath) => {
  try {
    if (Array.isArray(filePath)) return filePath;
    if (typeof filePath === 'string') {
      if (filePath.startsWith('[') && filePath.endsWith(']')) {
        return JSON.parse(filePath);
      }
      return [filePath];
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi parse file_path:', error, 'filePath:', filePath);
    return typeof filePath === 'string' ? [filePath] : [];
  }
};

const isPlayableFile = (filePath) => {
  if (!filePath) return false;
  const extension = path.extname(filePath).toLowerCase();
  return ['.mp4', '.webm', '.ogg'].includes(extension);
};

// Lecture Item component
const LectureItem = ({
  lecture,
  userRole,
  handleEdit,
  handleDelete,
  handleDownload,
  handlePlay,
  isOpen,
  toggleOpen,
}) => {
  const filePaths = parseFilePath(lecture.file_path);

  return (
    <div className="border border-gray-200 rounded-lg shadow-md mb-4 bg-white">
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-t-lg"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold text-gray-800">{lecture.title}</h3>
        {isOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </div>
      {isOpen && (
        <div className="p-4 space-y-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Mô tả:</span> {lecture.description || "Không có mô tả"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium mb-2">Danh sách file:</p>
            {filePaths.length > 0 ? (
              <ul className="space-y-2">
                {filePaths.map((filePath, fileIndex) => (
                  <li key={fileIndex} className="flex items-center space-x-2">
                    <span className="text-xl">{getFileIcon(filePath)}</span>
                    <span
                      className="text-gray-800 font-medium truncate flex-1"
                      title={lecture.fileNames && lecture.fileNames[fileIndex] ? lecture.fileNames[fileIndex] : getCleanFileName(filePath)}
                    >
                      {/* Hiển thị tên file gốc nếu có, nếu không thì dùng tên được làm sạch */}
                      {lecture.fileNames && lecture.fileNames[fileIndex]
                        ? lecture.fileNames[fileIndex]
                        : getCleanFileName(filePath)}
                    </span>
                    <div className="flex space-x-2">
                      {isPlayableFile(filePath) && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlay(lecture, fileIndex);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                          title="Phát"
                        >
                          <FaPlay className="w-5 h-5" />
                        </span>
                      )}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(lecture.id, fileIndex);
                        }}
                        className="text-teal-500 hover:text-teal-700 transition-colors cursor-pointer"
                        title="Tải xuống"
                      >
                        <FaDownload className="w-5 h-5" />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Không có file</p>
            )}
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={() => handleDownload(lecture.id)}
              className="group relative text-teal-500 hover:text-teal-700 transition-colors font-semibold py-2 px-4 rounded-lg hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center"
            >
              Tải xuống tất cả
              <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                Tải xuống tất cả {lecture.title}
              </span>
            </button>
            {userRole === 2 && (
              <div className="flex space-x-3">
                <span
                  onClick={() => handleEdit(lecture.id)}
                  className="text-yellow-500 hover:text-yellow-700 transition-colors cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <FaEdit className="w-5 h-5" />
                </span>
                <span
                  onClick={() => handleDelete(lecture.id)}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <FaTrash className="w-5 h-5" />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Lectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userParticipationId, setUserParticipationId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordion, setOpenAccordion] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState({});

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  // Edit states
  const [editLectureId, setEditLectureId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFiles, setEditFiles] = useState([]);
  const [removeFileIndices, setRemoveFileIndices] = useState([]);
  const [deleteLectureId, setDeleteLectureId] = useState(null);
  const [currentPlayingLecture, setCurrentPlayingLecture] = useState(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0); // Thêm state này

  const { classroomId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role_id);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!classroomId || !userId) {
        setError('Thiếu classroomId hoặc user_id');
        setLoading(false);
        return;
      }

      try {
        // Get user participation ID
        if (userRole === 2) {
          const participationId = await getUserParticipationId(userId, classroomId);
          setUserParticipationId(participationId);
        }

        // Fetch lectures
        const data = await fetchLectureOnClassroom(classroomId);
        const mappedLectures = data.map((lecture) => ({
          id: lecture.lecture_id,
          title: lecture.title,
          description: lecture.description,
          teacher: `Giáo viên: ${lecture.user_participation?.User?.username || 'Unknown'}`,
          className: `Lớp: Classroom ${lecture.user_participation?.classroomId || classroomId}`,
          thumbnail: 'https://via.placeholder.com/150',
          file_path: parseFilePath(lecture.file_path),
          fileNames: lecture.fileNames || [], // Store the original file names
        }));
        setLectures(mappedLectures);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu bài giảng');
        setLectures([]);
        setLoading(false);
      }
    };

    if (userId && classroomId) {
      fetchData();
    }
  }, [userId, classroomId, userRole]);

  const filteredLectures = lectures.filter((lecture) =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditFiles(files);
  };

  const handleRemoveExistingFile = (index) => {
    setRemoveFileIndices([...removeFileIndices, index]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title || uploadFiles.length === 0) {
      toast.error('Vui lòng điền tiêu đề và chọn ít nhất một file!');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadLecture(classroomId, uploadFiles, title, description);
      toast.success('Tải lên bài giảng thành công!');
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom", // Loại thông báo liên quan đến khóa học
        message: `Giảng viên ${user.fullname} đã tải lên bài giảng ${title}!`

      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);


      const newLecture = {
        id: response.data.lecture_id,
        title,
        description,
        teacher: `Giáo viên: ${JSON.parse(localStorage.getItem('user'))?.username || 'Unknown'}`,
        className: `Lớp: Classroom ${classroomId}`,
        thumbnail: 'https://via.placeholder.com/150',
        file_path: response.data.file_path ? JSON.parse(response.data.file_path) : uploadFiles.map(file => file.name),
      };

      setLectures([...lectures, newLecture]);
      setTitle('');
      setDescription('');
      setUploadFiles([]);
      setIsUploadModalOpen(false);
    } catch (error) {
      toast.error('Tải lên bài giảng thất bại: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  const handleDownload = async (lectureId, fileIndex) => {
    setIsDownloading((prev) => ({ ...prev, [`${lectureId}-${fileIndex}`]: true }));
    try {
      const lecture = lectures.find((l) => l.id === lectureId);
      if (!lecture) return;

      const { fileUrl, filename } = await downloadLecture(lectureId, fileIndex);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success(`Đã tải xuống ${filename} thành công!`);
    } catch (error) {
      toast.error('Không thể tải file: ' + error.message);
    } finally {
      setIsDownloading((prev) => ({ ...prev, [`${lectureId}-${fileIndex}`]: false }));
    }
  };

  const handleEdit = (lectureId) => {
    const lecture = lectures.find((l) => l.id === lectureId);
    if (lecture) {
      setEditLectureId(lectureId);
      setEditTitle(lecture.title);
      setEditDescription(lecture.description || "");
      setEditFiles([]);
      setExistingFiles(parseFilePath(lecture.file_path));
      setRemoveFileIndices([]);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle) {
      toast.error("Tiêu đề là trường bắt buộc!");
      return;
    }

    try {
      const response = await updateLecture(editLectureId, editFiles, editTitle, editDescription, removeFileIndices);
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom",
        message: `Giảng viên ${user.fullname} đã chỉnh sửa bài giảng ${title}, vui lòng xem các thay đổi`,
      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);
      toast.success('Chỉnh sửa bài giảng thành công!');

      setLectures(prevLectures =>
        prevLectures.map(lecture =>
          lecture.id === editLectureId
            ? {
              ...lecture,
              title: editTitle,
              description: editDescription,
              file_path: response.lecture.filePaths || parseFilePath(response.lecture.file_path),
              fileNames: response.lecture.fileNames
            }
            : lecture
        )
      );

      setIsEditModalOpen(false);
      setEditLectureId(null);
      setEditTitle('');
      setEditDescription('');
      setEditFiles([]);
      setRemoveFileIndices([]);
    } catch (error) {
      toast.error('Chỉnh sửa bài giảng thất bại: ' + error.message);
    }
  };

  const handleDelete = (lectureId) => {
    setDeleteLectureId(lectureId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteLecture(deleteLectureId);
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom",
        message: `Giảng viên ${user.fullname} đã xóa bài giảng ${title}`,
      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);
      toast.success('Xóa bài giảng thành công!');

      setLectures(lectures.filter((lecture) => lecture.id !== deleteLectureId));
    } catch (error) {
      toast.error('Xóa bài giảng thất bại: ' + error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteLectureId(null);
    }
  };

  const handlePlay = async (lecture, fileIndex) => {
    console.log("Playing video:", {
      lecture,
      fileIndex,
      filePath: lecture.file_path[fileIndex],
      isPlayable: isPlayableFile(lecture.file_path[fileIndex])
    });

    if (!isPlayableFile(lecture.file_path[fileIndex])) {
      toast.error("This file format is not playable");
      return;
    }

    try {
      const { fileUrl } = await downloadLecture(lecture.id, fileIndex);
      setCurrentPlayingLecture({ ...lecture, streamUrl: fileUrl });
      setCurrentFileIndex(fileIndex);
      setIsPlayerModalOpen(true);
    } catch (error) {
      toast.error("Không thể tải video: " + error.message);
    }
  };

  const toggleAccordion = (lectureId) => {
    setOpenAccordion(openAccordion === lectureId ? null : lectureId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />

      <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 to-teal-500 text-transparent bg-clip-text">
        Danh sách bài giảng
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm bài giảng..."
          className="w-full md:w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {userRole === 2 && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Tải lên bài giảng mới
          </button>
        )}
      </div>

      <ModalCustom title="Tải lên bài giảng mới" open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
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
            <label className="block text-gray-700 font-medium mb-1">File bài giảng</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
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
            disabled={isUploading}
            className={`w-full py-2 px-4 rounded-lg text-white ${isUploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } transition-all`}
          >
            {isUploading ? 'Đang tải lên...' : 'Tải lên'}
          </button>
        </form>
      </ModalCustom>

      <ModalCustom title="Chỉnh sửa bài giảng" open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
            <label className="block text-gray-700 font-medium mb-1">File hiện tại</label>
            {parseFilePath(lectures.find((l) => l.id === editLectureId)?.file_path || []).map(
              (filePath, index) =>
                !removeFileIndices.includes(index) && (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{getFileIcon(filePath)}</span>
                    <span className="text-gray-800 font-medium truncate flex-1">
                      {getCleanFileName(filePath)}
                    </span>
                    <button
                      onClick={() => handleRemoveExistingFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                )
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Thêm file mới (tùy chọn)</label>
            <input
              type="file"
              multiple
              onChange={handleEditFileChange}
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

      <ModalCustom
        title="Xác nhận xóa bài giảng"
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setDeleteLectureId(null);
        }}
      >
        <div className="space-y-4">
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa bài giảng này không?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
            >
              Xóa
            </button>
          </div>
        </div>
      </ModalCustom>

      <ModalCustom
        title={currentPlayingLecture?.title || 'Phát bài giảng'}
        open={isPlayerModalOpen}
        onOpenChange={setIsPlayerModalOpen}
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
            {currentPlayingLecture?.streamUrl ? (
              <video className="w-full h-full" controls autoPlay>
                <source src={currentPlayingLecture.streamUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="text-white p-4">Không có file video để phát</div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-800">{currentPlayingLecture?.title}</h3>
            <p className="text-gray-600">{currentPlayingLecture?.description}</p>
          </div>
        </div>
      </ModalCustom>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full" />
          <span className="ml-3 text-lg text-gray-600">Đang tải...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
      ) : (
        <>
          {filteredLectures.length === 0 ? (
            <div className="text-center text-gray-500 text-xl py-12 bg-white rounded-lg shadow-md">
              Không tìm thấy bài giảng nào.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLectures.map((lecture) => (
                <LectureItem
                  key={lecture.id}
                  lecture={lecture}
                  userRole={userRole}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleDownload={handleDownload}
                  handlePlay={handlePlay}
                  isOpen={openAccordion === lecture.id}
                  toggleOpen={() => toggleAccordion(lecture.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
import { getSubmissionsByAssignment } from "../../services/SubmissionService";
import { toast } from "react-toastify";
import path from "path-browserify";
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
  FaUpload,
  FaStar, // Icon mới cho nút "Chấm điểm"
} from "react-icons/fa";

// Hàm loại bỏ tiền tố "uploads\assignment\" khỏi tên file
const getCleanFileName = (filePath) => {
  const baseName = path.basename(filePath);
  return baseName.replace(/^uploads\\assignment\\/i, "");
};

// Hàm xác định icon dựa trên định dạng file
const getFileIcon = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case ".pdf":
      return <FaFilePdf className="text-red-500" />;
    case ".pptx":
    case ".ppt":
      return <FaFilePowerpoint className="text-orange-500" />;
    case ".doc":
    case ".docx":
      return <FaFileWord className="text-blue-500" />;
    case ".xlsx":
    case ".xls":
      return <FaFileExcel className="text-green-500" />;
    case ".jpg":
    case ".jpeg":
    case ".png":
      return <FaFileImage className="text-purple-500" />;
    default:
      return <FaFile className="text-gray-500" />;
  }
};

// Hàm parse file_path với error handling
const parseFilePath = (filePath) => {
  try {
    if (Array.isArray(filePath)) return filePath;
    if (typeof filePath === "string") {
      if (filePath.startsWith("[") && filePath.endsWith("]")) {
        return JSON.parse(filePath);
      }
      return [filePath];
    }
    return [];
  } catch (error) {
    console.error("Lỗi khi parse file_path:", error, "filePath:", filePath);
    return typeof filePath === "string" ? [filePath] : [];
  }
};

const AccordionItem = ({
  assignment,
  userRole,
  userId,
  handleEdit,
  handleDelete,
  handleDownload,
  handleSubmitAssignment,
  isOpen,
  toggleOpen,
}) => {
  const filePaths = parseFilePath(assignment.file_path);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const navigate = useNavigate(); // Hook để điều hướng

  // Kiểm tra trạng thái nộp bài khi accordion mở (dành cho học sinh)
  useEffect(() => {
    if (userRole === 1 && isOpen) {
      const checkSubmission = async () => {
        try {
          const response = await getSubmissionsByAssignment(assignment.assignment_id);
          const userSubmission = response.submissions.find((sub) => sub.user_id === userId);
          setHasSubmitted(!!userSubmission);
        } catch (error) {
          console.error("Lỗi khi kiểm tra bài nộp:", error);
          setHasSubmitted(false);
        }
      };
      checkSubmission();
    }
  }, [isOpen, userRole, userId, assignment.assignment_id]);

  const handleFileChange = (e) => {
    setSubmissionFiles(Array.from(e.target.files));
  };

  const onSubmitAssignment = async (e) => {
    e.preventDefault();
    if (submissionFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một file để nộp!");
      return;
    }
    try {
      await handleSubmitAssignment(assignment.assignment_id, submissionFiles);
      setHasSubmitted(true);
      setSubmissionFiles([]);
    } catch (error) {
      // Lỗi đã được xử lý trong handleSubmitAssignment
    }
  };

  // Xử lý khi nhấn nút "Chấm điểm" (dành cho giáo viên)
  const handleGradeClick = () => {
    navigate(`/assignments/${assignment.assignment_id}/grade`);
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-md mb-4 bg-white">
      <div
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 rounded-t-lg"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
        {isOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </div>
      {isOpen && (
        <div className="p-4 space-y-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Mô tả:</span> {assignment.description || "Không có"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <p className="text-gray-600">
              <span className="font-medium">Ngày bắt đầu:</span>{" "}
              {assignment.start_assignment ? new Date(assignment.start_assignment).toLocaleDateString() : "Không có"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Ngày kết thúc:</span>{" "}
              {assignment.end_assignment ? new Date(assignment.end_assignment).toLocaleDateString() : "Không có"}
            </p>
          </div>
          <div>
            <p className="text-gray-600 font-medium mb-2">Danh sách file:</p>
            {filePaths.length > 0 ? (
              <ul className="space-y-2">
                {filePaths.map((filePath, fileIndex) => (
                  <li key={fileIndex} className="flex items-center space-x-2">
                    <span className="text-xl">{getFileIcon(filePath)}</span>
                    <span className="text-gray-800 font-medium truncate flex-1" title={getCleanFileName(filePath)}>
                      {getCleanFileName(filePath)}
                    </span>
                    <span
                      onClick={() => handleDownload(assignment.assignment_id, fileIndex)}
                      className="text-teal-500 hover:text-teal-700 transition-colors cursor-pointer"
                      title="Tải xuống"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Không có file</p>
            )}
          </div>

          {userRole === 1 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Nộp bài tập</h4>
              {hasSubmitted ? (
                <p className="text-green-600 font-semibold flex items-center">
                  <FaUpload className="mr-2" /> Đã nộp bài
                </p>
              ) : (
                <form onSubmit={onSubmitAssignment} className="space-y-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all flex items-center"
                  >
                    <FaUpload className="mr-2" /> Nộp bài
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => handleDownload(assignment.assignment_id)}
              className="group relative text-teal-500 hover:text-teal-700 transition-colors font-semibold py-2 px-4 rounded-lg hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center"
            >
              Tải xuống tất cả
              <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                Tải xuống tất cả {assignment.title}
              </span>
            </button>
            {userRole === 2 && (
              <div className="flex space-x-3">
                <span
                  onClick={() => handleEdit(assignment.assignment_id)}
                  className="text-yellow-500 hover:text-yellow-700 transition-colors cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <FaEdit className="w-5 h-5" />
                </span>
                <span
                  onClick={() => handleDelete(assignment.assignment_id)}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <FaTrash className="w-5 h-5" />
                </span>
                <span
                  onClick={handleGradeClick}
                  className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                  title="Chấm điểm"
                >
                  <FaStar className="w-5 h-5" />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccordionItem;
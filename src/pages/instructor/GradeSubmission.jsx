import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissionsByAssignment, gradeSubmission } from "../../services/SubmissionService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import path from "path-browserify";
import {
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFile,
} from "react-icons/fa";

// Hàm loại bỏ tiền tố "uploads\submission\" khỏi tên file
const getCleanFileName = (filePath) => {
  const baseName = path.basename(filePath);
  return baseName.replace(/^uploads\\submission\\/i, "");
};

// Hàm xác định icon dựa trên định dạng file
const getFileIcon = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case ".pdf":
      return <FaFilePdf className="text-red-500 text-2xl" />;
    case ".pptx":
    case ".ppt":
      return <FaFilePowerpoint className="text-orange-500 text-2xl" />;
    case ".doc":
    case ".docx":
      return <FaFileWord className="text-blue-500 text-2xl" />;
    case ".xlsx":
    case ".xls":
      return <FaFileExcel className="text-green-500 text-2xl" />;
    case ".jpg":
    case ".jpeg":
    case ".png":
      return <FaFileImage className="text-purple-500 text-2xl" />;
    default:
      return <FaFile className="text-gray-500 text-2xl" />;
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

const GradeSubmission = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingData, setGradingData] = useState({});
  const [userRole, setUserRole] = useState(null);

  // Lấy userRole từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserRole(user.role_id);
    } else {
      setError("Bạn cần đăng nhập để truy cập trang này.");
      setLoading(false);
    }
  }, []);

  // Lấy danh sách bài nộp
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        if (!assignmentId) {
          throw new Error("Không có assignmentId hợp lệ.");
        }
        const data = await getSubmissionsByAssignment(assignmentId);
        setSubmissions(data.submissions || []);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách bài nộp: " + err.message);
        setLoading(false);
      }
    };

    if (userRole === 2 && assignmentId) {
      fetchSubmissions();
    } else if (userRole !== null && userRole !== 2) {
      setError("Bạn không có quyền truy cập trang này.");
      setLoading(false);
    }
  }, [assignmentId, userRole]);

  const handleGradeChange = (submissionId, field, value) => {
    setGradingData((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleSubmitGrade = async (submissionId) => {
    const { score, feedback } = gradingData[submissionId] || {};

    if (!score || score < 0 || score > 10) { // Sửa giới hạn điểm từ 100 thành 10
      toast.error("Vui lòng nhập điểm hợp lệ (0-10)!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      await gradeSubmission(submissionId, score, feedback);
      toast.success("Chấm điểm bài nộp thành công!", {
        position: "top-center",
        autoClose: 3000,
      });
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.submission_id === submissionId
            ? { ...submission, score, feedback, status: "graded" }
            : submission
        )
      );
      setGradingData((prev) => {
        const newData = { ...prev };
        delete newData[submissionId];
        return newData;
      });
    } catch (error) {
      toast.error("Chấm điểm thất bại: " + error.message, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin inline-block w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full" />
        <span className="ml-4 text-xl font-semibold text-gray-700">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center text-red-600 text-2xl font-semibold bg-white p-6 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }

  if (userRole !== 2) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center text-red-600 text-2xl font-semibold bg-white p-6 rounded-lg shadow-lg">
          Bạn không có quyền truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl my-10 mx-auto p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">

      <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text drop-shadow-lg">
        Chấm Điểm Bài Nộp - Assignment {assignmentId}
      </h1>

      {submissions.length === 0 ? (
        <div className="text-center text-gray-600 text-xl py-12 bg-white rounded-xl shadow-lg max-w-md mx-auto border border-gray-200">
          Chưa có bài nộp nào cho assignment này.
        </div>
      ) : (
        <div className="space-y-8">
          {submissions.map((submission) => {
            const filePaths = parseFilePath(submission.file_path);
            return (
              <div
                key={submission.submission_id}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Bài nộp của User ID: {submission.user_id}
                </h2>
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Thời gian nộp:</span>{" "}
                  {new Date(submission.submitted_at).toLocaleString()}
                </p>

                {/* Hiển thị file với icon */}
                <div className="mb-4">
                  <p className="text-gray-700 font-medium mb-2">File đính kèm:</p>
                  {filePaths.length > 0 ? (
                    <ul className="space-y-2">
                      {filePaths.map((filePath, fileIndex) => (
                        <li key={fileIndex} className="flex items-center space-x-3">
                          <span>{getFileIcon(filePath)}</span>
                          <span
                            className="text-gray-800 font-medium truncate flex-1"
                            title={getCleanFileName(filePath)}
                          >
                            {getCleanFileName(filePath)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Không có file đính kèm</p>
                  )}
                </div>

                {/* Hiển thị điểm và phản hồi nếu có */}
                
                {submission.feedback && (
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">Phản hồi:</span> {submission.feedback}
                  </p>
                )}

                {/* Form chấm điểm */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Điểm </label> {/* Sửa nhãn */}
                    <input
                      type="number"
                      min="0"
                      max="10" // Sửa giới hạn input thành 10
                      step="0.1" // Cho phép điểm thập phân (ví dụ: 8.5)
                      value={
                        gradingData[submission.submission_id]?.score !== undefined
                          ? gradingData[submission.submission_id].score
                          : submission.score !== null
                          ? submission.score
                          : ""
                      }
                      onChange={(e) => handleGradeChange(submission.submission_id, "score", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      placeholder="Nhập điểm "
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Phản hồi</label>
                    <textarea
                      value={
                        gradingData[submission.submission_id]?.feedback !== undefined
                          ? gradingData[submission.submission_id].feedback
                          : submission.feedback || ""
                      }
                      onChange={(e) => handleGradeChange(submission.submission_id, "feedback", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      rows="4"
                      placeholder="Nhập phản hồi (nếu có)"
                    />
                  </div>
                  <button
                    onClick={() => handleSubmitGrade(submission.submission_id)}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-md"
                  >
                    Chấm Điểm
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-10 w-full max-w-xs mx-auto bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300 shadow-md"
      >
        Quay Lại
      </button>
    </div>
  );
};

export default GradeSubmission;
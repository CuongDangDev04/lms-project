import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExamsByClassroom, getExamResults } from "../../services/quizService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";
import Pagination from "../../components/users/Pagination";

const ExamResults = () => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const { classroomId, examId } = useParams();

  useEffect(() => {
    const fetchExams = async () => {
      if (classroomId) {
        setLoading(true);
        try {
          const data = await getExamsByClassroom(classroomId);
          setExams(data || []);
          setCurrentPage(1);
          console.log("Exams:", data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách bài thi:", error);
          toast.error("Lỗi khi tải danh sách bài thi!");
          setExams([]);
        } finally {
          setLoading(false);
        }
      } else {
        setExams([]);
      }
    };
    fetchExams();
  }, [classroomId]);

  useEffect(() => {
    const fetchResults = async () => {
      if (examId) {
        setResultsLoading(true);
        try {
          const data = await getExamResults(examId);
          setResults(data || []);
        } catch (error) {
          console.error("API error:", error.response?.status, error.response?.data);
          toast.error(error.response?.status === 404 ? "Không tìm thấy bài thi!" : "Lỗi khi tải kết quả!");
          setResults([]);
        } finally {
          setResultsLoading(false);
        }
      } else {
        setResults([]);
      }
    };
    fetchResults();
  }, [examId]);

  const handleExamClick = (examId) => {
    navigate(`/courseDetail/${classroomId}/exam-results/${examId}`);
  };

  const handleBackClick = () => {
    navigate(`/courseDetail/${classroomId}/exam-results`);
  };

  const handleBackToCourse = () => {
    navigate(`/courseDetail/${classroomId}/create-exam`);
  };

  const selectedExamTitle = exams.find((e) => e.exam_id === parseInt(examId))?.title || "Không xác định";

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = exams.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 lg:p-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center">
          Kết quả bài thi
        </h1>

        {loading && (
          <div className="flex justify-center items-center mb-6">
            <FaSpinner className="animate-spin text-teal-500 text-2xl mr-2" />
            <span className="text-gray-600">Đang tải...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {examId ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Kết quả: {selectedExamTitle}
                  </h2>
                  <button
                    onClick={handleBackClick}
                    className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center gap-2"
                  >
                    <FaArrowLeft /> Quay lại
                  </button>
                </div>
                {resultsLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <FaSpinner className="animate-spin text-teal-500 text-2xl mr-2" />
                    <span className="text-gray-600">Đang tải kết quả...</span>
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-gray-600 text-center p-4 bg-white rounded-lg shadow">
                    Chưa có kết quả nào cho bài thi này.
                  </p>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-blue-400 to-blue-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">STT</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Tên học viên</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Mã học viên</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Điểm</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Thời gian nộp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {results.map((result, index) => (
                          <tr key={result.result_id} className="hover:bg-gray-50 transition-all duration-200">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{result.user_participation.User.fullname}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{result.user_participation.User.username}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {result.score !== null ? result.score : "Chưa chấm"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(result.submitted_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              classroomId && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Danh sách bài thi
                    </h2>
                    <button
                      onClick={handleBackToCourse}
                      className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center gap-2"
                    >
                      <FaArrowLeft /> Quay lại 
                    </button>
                  </div>
                  {exams.length === 0 ? (
                    <p className="text-gray-600 text-center p-4 bg-white rounded-lg shadow">
                      Chưa có bài thi nào trong lớp học này.
                    </p>
                  ) : (
                    <>
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-blue-400 to-blue-600">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">STT</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Tiêu đề bài thi</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Số câu hỏi</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Ngày tạo</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Hạn chót</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {currentExams.map((exam, index) => (
                              <tr
                                key={exam.exam_id}
                                className="hover:bg-gray-50 transition-all duration-200"
                              >
                                <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{exam.title}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {(exam.questions || exam.Questions)?.length || 0}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(exam.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {new Date(exam.deadline).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <button
                                    onClick={() => handleExamClick(exam.exam_id)}
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-1 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                                  >
                                    Xem kết quả
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </>
                  )}
                </div>
              )
            )}
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          limit={1}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default ExamResults;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllClassrooms, getExamsByClassroom, getExamResults } from "../../services/quizService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner } from "react-icons/fa";
import Pagination from "../../components/admin/Pagination"; // Import component Pagination

const ExamResults = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Trạng thái trang hiện tại
  const [itemsPerPage] = useState(5); // Số bài thi trên mỗi trang (có thể tùy chỉnh)
  const navigate = useNavigate();
  const { examId } = useParams();

  // Lấy danh sách lớp học
  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const data = await getAllClassrooms();
        setClassrooms(data.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lớp học:", error);
        toast.error("Lỗi khi tải danh sách lớp học!");
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  // Lấy danh sách bài thi theo lớp học
  useEffect(() => {
    const fetchExams = async () => {
      if (classroomId) {
        setLoading(true);
        try {
          const data = await getExamsByClassroom(classroomId);
          setExams(data);
          setCurrentPage(1); // Reset về trang 1 khi danh sách bài thi thay đổi
        } catch (error) {
          console.error("Lỗi khi lấy danh sách bài thi:", error);
          toast.error("Lỗi khi tải danh sách bài thi!");
        } finally {
          setLoading(false);
        }
      } else {
        setExams([]);
      }
    };
    fetchExams();
  }, [classroomId]);

  // Lấy kết quả bài thi theo examId
  useEffect(() => {
    const fetchResults = async () => {
      if (examId) {
        setResultsLoading(true);
        try {
          const data = await getExamResults(examId);
          setResults(data);

          if (!classroomId && data.length > 0) {
            const exam = exams.find((e) => e.exam_id === parseInt(examId));
            if (exam) {
              setClassroomId(exam.classroom_id.toString());
            } else {
              const allExams = await getExamsByClassroom(data[0]?.user_participation?.classroom_id);
              setExams(allExams);
              setClassroomId(data[0]?.user_participation?.classroom_id.toString() || "");
            }
          }
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
  }, [examId, classroomId, exams]);

  const handleExamClick = (examId) => {
    navigate(`/admin/exam-results/${examId}`);
  };

  // Tìm tiêu đề bài thi dựa trên examId
  const selectedExamTitle = exams.find((e) => e.exam_id === parseInt(examId))?.title || "Không xác định";

  // Logic phân trang
  const totalPages = Math.ceil(exams.length / itemsPerPage); // Tính tổng số trang
  const startIndex = (currentPage - 1) * itemsPerPage; // Chỉ số bắt đầu của trang hiện tại
  const endIndex = startIndex + itemsPerPage; // Chỉ số kết thúc của trang hiện tại
  const currentExams = exams.slice(startIndex, endIndex); // Lấy danh sách bài thi cho trang hiện tại

  // Hàm xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Tiêu đề */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 text-center">
          Kết quả bài thi
        </h1>

        {/* Dropdown chọn lớp học */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn lớp học
          </label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300"
            disabled={loading}
          >
            <option value="">Chọn lớp học</option>
            {classrooms.map((classroom) => (
              <option key={classroom.classroom_id} value={classroom.classroom_id}>
                {classroom.Class.class_name} - {classroom.Course.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Loading tổng thể */}
        {loading && (
          <div className="flex justify-center items-center mb-6">
            <FaSpinner className="animate-spin text-teal-500 text-2xl mr-2" />
            <span className="text-gray-600">Đang tải...</span>
          </div>
        )}

        {/* Kết quả và danh sách bài thi */}
        {!loading && (
          <div className="space-y-8">
            {/* Kết quả chi tiết (hiển thị trước) */}
            {examId && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Kết quả: {selectedExamTitle}
                </h2>
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
                      <thead className="bg-teal-500">
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
            )}

            {/* Danh sách bài thi (hiển thị sau) */}
            {classroomId && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Danh sách bài thi
                </h2>
                {exams.length === 0 ? (
                  <p className="text-gray-600 text-center p-4 bg-white rounded-lg shadow">
                    Chưa có bài thi nào trong lớp học này.
                  </p>
                ) : (
                  <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-teal-500">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">STT</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Tiêu đề bài thi</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Số câu hỏi</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {currentExams.map((exam, index) => (
                            <tr
                              key={exam.exam_id}
                              className={`${
                                exam.exam_id === parseInt(examId) ? "bg-teal-50" : "hover:bg-gray-50"
                              } transition-all duration-200`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{exam.title}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {(exam.questions || exam.Questions)?.length || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(exam.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={() => handleExamClick(exam.exam_id)}
                                  className="bg-teal-500 text-white px-4 py-1 rounded-lg hover:bg-teal-600 transition-all duration-300"
                                >
                                  Xem kết quả
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Gọi component Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Toast */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          limit={1}
          theme="colored"
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default ExamResults;
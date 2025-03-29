import { useEffect, useState } from "react";
import { getExamsByClassroomSimple } from "../../services/quizService";
import { useParams, useNavigate } from "react-router-dom";
import Pagination from "../../components/users/Pagination";

const ListExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { classroomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExamsByClassroomSimple(classroomId);
        setExams(Array.isArray(data) ? data : []);
        setCurrentPage(1);
      } catch (err) {
        setError("Không thể tải danh sách bài thi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [classroomId]);

  const handleExamClick = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const totalPages = Math.ceil(exams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExams = exams.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Danh sách bài thi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Chọn bài thi để bắt đầu làm bài
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500">Hiện tại chưa có bài thi nào trong lớp học này.</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-400 to-blue-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">STT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Tiêu đề bài thi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Bắt đầu</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentExams.map((exam, index) => (
                    <tr
                      key={exam.exam_id}
                      className="hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">{startIndex + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">{exam.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{exam.duration} phút</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(exam.start_time).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleExamClick(exam.exam_id)}
                          className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-1 rounded-lg hover:bg-indigo-700 transition-all duration-300"
                        >
                          Làm bài
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListExams;
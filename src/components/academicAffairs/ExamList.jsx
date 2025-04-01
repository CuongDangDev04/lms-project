import React, { useState } from 'react';
import { FaSpinner, FaEye } from 'react-icons/fa';
import Pagination from '../users/Pagination';

const ExamList = ({ exams, examLoading, handleExamClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 6;

  const totalPages = Math.ceil(exams.length / examsPerPage);
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">
        Danh sách bài thi trong lớp học
      </h2>

      {examLoading ? (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-teal-500 text-2xl mr-2" />
          <span className="text-gray-600">Đang tải danh sách bài thi...</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center text-gray-600 p-4 bg-white rounded-lg shadow">
          Chưa có bài thi nào trong lớp học này.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-400 to-blue-600">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Tiêu đề bài thi
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Số câu hỏi
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Bắt đầu
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Hạn chót
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Ẩn kết quả
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentExams.map((exam, index) => (
                  <tr
                    key={exam.exam_id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{indexOfFirstExam + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs">{exam.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(exam.Questions || exam.questions)?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.duration} phút</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(exam.start_time).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(exam.deadline).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {exam.hide_results ? 'Có' : 'Không'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleExamClick(exam)}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-1 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center gap-1"
                      >
                        <FaEye /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExamList;
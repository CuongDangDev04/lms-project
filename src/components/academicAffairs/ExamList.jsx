import React, { useState, useEffect } from 'react';
import { FaSpinner, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Pagination from '../users/Pagination';
import imgNoExam from '../../assets/user/no-exam.jpg';

const ExamList = ({ exams, examLoading, handleExamClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 6;

  useEffect(() => {
    console.log('Danh sách bài thi nhận được (ExamList):', exams);
    console.log('Múi giờ hiện tại của trình duyệt:', new Date().toString());
  }, [exams]);

  const totalPages = Math.ceil(exams.length / examsPerPage);
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm định dạng thời gian với date-fns
  const formatVietnamTime = (dateString) => {
    const date = new Date(dateString);
    const formatted = format(date, 'dd/MM/yyyy, HH:mm', { locale: vi });
    console.log(`Định dạng thời gian (${dateString}):`, {
      raw: dateString,
      parsed: date.toISOString(),
      formatted: formatted,
    });
    return formatted;
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
        <div className="flex w-full flex-col h-[400px] items-center py-8 sm:py-12 bg-gray-50">
          <img
            src={imgNoExam}
            alt="Không tìm thấy bài thi"
            className="w-full h-[300px] sm:w-full sm:h-[300px] object-contain"
          />
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
                    Thời gian
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Bắt đầu
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Hạn chót
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
                    <td className="px-4 py-3 text-sm text-gray-900">{exam.duration} phút</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatVietnamTime(exam.start_time)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatVietnamTime(exam.deadline)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleExamClick(exam)}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-1 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center gap-1"
                      >
                        <FaEye /> Làm bài
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
import React, { useState } from 'react';
import Pagination from '../admin/Pagination';

const ExamList = ({ exams, examLoading, handleExamClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 5;

  const totalPages = Math.ceil(exams.length / examsPerPage);
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Danh sách bài thi trong lớp học</h2>
      {examLoading ? (
        <div className="text-center text-gray-600">Đang tải danh sách bài thi...</div>
      ) : exams.length === 0 ? (
        <div className="text-center text-gray-600 p-4 bg-white rounded-lg shadow">
          Chưa có bài thi nào trong lớp học này.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentExams.map((exam) => (
              <div
                key={exam.exam_id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                onClick={() => handleExamClick(exam)}
              >
                <h3 className="text-lg font-medium text-gray-800">{exam.title}</h3>
                <p className="text-sm text-gray-600">
                  Số câu hỏi: {exam.Questions ? exam.Questions.length : 0}
                </p>
                <p className="text-sm text-gray-600">Thời gian: {exam.duration} phút</p>
                <p className="text-sm text-gray-600">
                  Bắt đầu: {new Date(exam.start_time).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Hạn chót: {new Date(exam.deadline).toLocaleString()} {/* Hiển thị deadline */}
                </p>
                <p className="text-sm text-gray-600">
                  Ẩn kết quả: {exam.hide_results ? "Có" : "Không"}
                </p>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default ExamList;
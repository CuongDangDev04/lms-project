import React from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { ModalCustom } from '../admin/ui/ModalCustom';

const ExamPreviewModal = ({ exam, open, onOpenChange }) => {
  const navigate = useNavigate(); // Khởi tạo useNavigate

  // Xác định mảng questions từ exam, xử lý cả "questions" hoặc "Questions"
  const questions = exam?.questions || exam?.Questions || [];

  // Hàm xử lý khi nhấn nút "Xem kết quả thi"
  const handleViewResults = () => {
    if (exam?.exam_id) {
      navigate(`/admin/exam-results/${exam.exam_id}`);
    }
  };

  return (
    <ModalCustom
      title="Xem trước bài thi"
      open={open}
      onOpenChange={onOpenChange}
      triggerText=""
      triggerClass="hidden"
    >
      {exam ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Tiêu đề: {exam.title}</h3>
            <p className="text-sm text-gray-600">Thời gian: {exam.duration} phút</p>
            <p className="text-sm text-gray-600">Ẩn kết quả: {exam.hide_results ? "Có" : "Không"}</p>
            <p className="text-sm text-gray-600">
              Thời gian bắt đầu: {new Date(exam.start_time).toLocaleString()}
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Danh sách câu hỏi</h4>
            {questions.length > 0 ? (
              questions.map((q, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-800">{index + 1}. {q.content}</p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, oIndex) => (
                      <li
                        key={oIndex}
                        className={`text-sm ${
                          opt.is_correct ? "text-green-600 font-semibold" : "text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(97 + oIndex)}. {opt.content}{" "}
                        {opt.is_correct ? "(Đáp án đúng)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">Không có câu hỏi nào được tạo.</p>
            )}
          </div>
          {/* Nút Xem kết quả thi */}
          <div className="flex justify-end">
            <button
              onClick={handleViewResults}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-sm font-semibold text-sm"
            >
              Xem kết quả thi
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Không có dữ liệu bài thi để hiển thị.</p>
      )}
    </ModalCustom>
  );
};

export default ExamPreviewModal;
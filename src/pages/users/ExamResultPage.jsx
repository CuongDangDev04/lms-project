import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamDetails, getResult } from "../../services/quizService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSpinner, FaArrowLeft } from "react-icons/fa";

const ExamResultPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const examData = await getExamDetails(examId);
        setExam(examData);

        const resultData = await getResult(examId);
        setResult(resultData);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu kết quả!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const calculateStats = () => {
    if (!exam || !exam.Questions || !result || !result.ResultAnswers) {
      return { correct: 0, incorrect: 0, unanswered: 0 };
    }

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    exam.Questions.forEach((question) => {
      const userAnswer = result.ResultAnswers.find(
        (ra) => ra.question_id === question.question_id
      );
      const correctOption = question.options?.find((opt) => opt.is_correct); // Sử dụng 'options'

      if (!userAnswer) {
        unanswered++;
      } else if (correctOption && userAnswer.selected_option_id === correctOption.option_id) {
        correct++;
      } else {
        incorrect++;
      }
    });

    return { correct, incorrect, unanswered };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-teal-400 text-3xl" />
          <span className="text-gray-500">Đang tải kết quả...</span>
        </div>
      </div>
    );
  }

  if (!exam || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Không tìm thấy dữ liệu bài thi hoặc kết quả.</p>
      </div>
    );
  }

  const stats = calculateStats();
  const totalQuestions = exam.Questions?.length || 0;

  return (
    <div className="min-h-screen mt-20 bg-gray-50 flex">
      {/* Phần nội dung chính */}
      <div className="flex-1 p-6">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center mb-6 rounded-lg">
          <h1 className="text-xl font-medium text-gray-700">
            Kết quả bài thi: {exam.title}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full text-gray-600 font-medium border border-gray-200 hover:bg-gray-100 transition-all duration-200 flex items-center gap-2"
          >
            <FaArrowLeft /> Quay lại trang chủ
          </button>
        </header>

        <div className="space-y-6">
          {exam.Questions.map((question, qIndex) => {
            const userAnswer = result.ResultAnswers.find(
              (ra) => ra.question_id === question.question_id
            );
            const selectedOptionId = userAnswer ? userAnswer.selected_option_id : null;
            const correctOption = question.options?.find((opt) => opt.is_correct); // Sử dụng 'options'
            const status = exam.hide_results
              ? selectedOptionId
                ? "Đã chọn"
                : "Chưa trả lời"
              : selectedOptionId
              ? selectedOptionId === correctOption?.option_id
                ? "Đúng"
                : "Sai"
              : "Chưa trả lời";

            return (
              <div
                key={question.question_id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <h2 className="text-lg font-medium text-gray-700 mb-4">
                  Câu {qIndex + 1}
                </h2>
                <p className="text-gray-600 mb-4">{question.content}</p>
                <div className="space-y-3">
                  {question.options?.map((option, optIndex) => (
                    <label
                      key={option.option_id}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 transition-all duration-200 ${
                        exam.hide_results
                          ? selectedOptionId === option.option_id
                            ? "bg-teal-50 border-teal-300"
                            : "bg-gray-50"
                          : option.is_correct
                          ? "bg-green-50 border-green-300"
                          : selectedOptionId === option.option_id && !option.is_correct
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-600">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <input
                        type="radio"
                        name={`question-${question.question_id}`}
                        value={option.option_id}
                        checked={selectedOptionId === option.option_id}
                        disabled
                        className="h-5 w-5 text-teal-500 focus:ring-teal-400 border-gray-300 cursor-not-allowed"
                      />
                      <span
                        className={`text-sm text-gray-600 ${
                          exam.hide_results
                            ? selectedOptionId === option.option_id
                              ? "text-teal-600 font-semibold"
                              : ""
                            : option.is_correct
                            ? "text-green-600 font-semibold"
                            : selectedOptionId === option.option_id && !option.is_correct
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {option.content}
                      </span>
                      {!exam.hide_results && option.is_correct && (
                        <span className="text-green-600 text-xs font-semibold ml-2">
                          (Đáp án đúng)
                        </span>
                      )}
                    </label>
                  )) || (
                    <p className="text-gray-500">Không có lựa chọn nào.</p>
                  )}
                  {!selectedOptionId && (
                    <p className="text-sm text-gray-500 italic mt-2">
                      Bạn chưa chọn đáp án cho câu này.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-1/4 bg-teal-50 text-gray-700 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-600">Tổng quan kết quả</h2>
          <p className="text-2xl font-bold text-teal-600">
            {exam.hide_results ? "Ẩn" : `${result.score}%`}
          </p>
          {!exam.hide_results && (
            <p className="text-sm text-gray-600">
              {stats.correct}/{totalQuestions} câu đúng
            </p>
          )}
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-600">Thống kê</h2>
          {exam.hide_results ? (
            <p className="text-sm text-gray-600">
              Kết quả đã bị ẩn theo cài đặt bài thi.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Số câu đúng: <span className="text-green-600 font-semibold">{stats.correct}</span>
              </p>
              <p className="text-sm text-gray-600">
                Số câu sai: <span className="text-red-600 font-semibold">{stats.incorrect}</span>
              </p>
              <p className="text-sm text-gray-600">
                Số câu chưa trả lời: <span className="text-gray-600 font-semibold">{stats.unanswered}</span>
              </p>
            </>
          )}
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-600 mb-2">Phiếu bài làm</h2>
          <div className="grid grid-cols-5 gap-2">
            {exam.Questions.map((question, index) => {
              const userAnswer = result.ResultAnswers.find(
                (ra) => ra.question_id === question.question_id
              );
              const correctOption = question.options?.find((opt) => opt.is_correct);
              const isCorrect = userAnswer && userAnswer.selected_option_id === correctOption?.option_id;
              const isAnswered = !!userAnswer;

              return (
                <button
                  key={index}
                  className={`p-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    exam.hide_results
                      ? isAnswered
                        ? "bg-teal-200 text-teal-800"
                        : "bg-gray-100 text-gray-600"
                      : isCorrect
                      ? "bg-green-200 text-green-800"
                      : isAnswered
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  disabled
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

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
  );
};

export default ExamResultPage;
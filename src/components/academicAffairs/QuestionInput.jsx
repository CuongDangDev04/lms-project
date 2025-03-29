import React from 'react';

const QuestionInput = ({ qIndex, question, setQuestions, questions, loading }) => {
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].content = value;
    console.log('Câu hỏi sau khi thay đổi:', updatedQuestions);
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...questions];
    if (field === "is_correct") {
      updatedQuestions[qIndex].options.forEach((opt, idx) => {
        opt.is_correct = idx === oIndex; // Đặt is_correct cho lựa chọn được chọn
      });
    } else {
      updatedQuestions[qIndex].options[oIndex][field] = value; // Cập nhật content của lựa chọn
    }
    console.log('Lựa chọn sau khi thay đổi:', updatedQuestions);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-4 border border-gray-200">
      <input
        type="text"
        value={question.content}
        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
        placeholder="Nhập nội dung câu hỏi"
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-sm"
        disabled={loading}
      />
      {question.options.map((opt, oIndex) => (
        <div key={oIndex} className="flex items-center mt-3 gap-3">
          <input
            type="text"
            value={opt.content}
            onChange={(e) => handleOptionChange(qIndex, oIndex, "content", e.target.value)}
            placeholder={`Lựa chọn ${oIndex + 1}`}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 text-sm"
            disabled={loading}
          />
          <input
            type="radio"
            name={`correct-${qIndex}`}
            checked={opt.is_correct}
            onChange={() => handleOptionChange(qIndex, oIndex, "is_correct", true)}
            className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300"
            disabled={loading}
          />
          <span className="text-sm text-gray-600">Đúng</span>
        </div>
      ))}
    </div>
  );
};

export default QuestionInput;
import React from 'react';
import { ModalCustom } from '../admin/ui/ModalCustom';
import QuestionInput from './QuestionInput';

const ExamFormModal = ({
  title, setTitle, classroomId, setClassroomId, questions, setQuestions,
  duration, setDuration, startTime, setStartTime, deadline, setDeadline, // Thêm deadline
  hideResults, setHideResults, classrooms, loading, handleSubmit, addQuestion, isOpen, setIsOpen
}) => {
  return (
    <ModalCustom
      title="Tạo bài thi bằng form"
      open={isOpen}
      onOpenChange={setIsOpen}
      triggerText=""
      triggerClass="hidden"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Tiêu đề bài thi</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
            placeholder="Nhập tiêu đề bài thi"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Lớp học</label>
          <select
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
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

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Thời gian làm bài (phút)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
            placeholder="Nhập thời gian (phút)"
            min="1"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Hạn chót nộp bài</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm"
            disabled={loading}
            required // Bắt buộc nhập
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hideResults}
            onChange={(e) => setHideResults(e.target.checked)}
            className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
            disabled={loading}
          />
          <label className="text-sm font-medium text-gray-600">Ẩn kết quả khỏi sinh viên</label>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Câu hỏi</h2>
          {questions.map((q, qIndex) => (
            <QuestionInput
              key={qIndex}
              qIndex={qIndex}
              question={q}
              setQuestions={setQuestions}
              questions={questions}
              loading={loading}
            />
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={addQuestion}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm"
            disabled={loading}
          >
            Thêm câu hỏi
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-full hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo bài thi"}
          </button>
        </div>
      </form>
    </ModalCustom>
  );
};

export default ExamFormModal;
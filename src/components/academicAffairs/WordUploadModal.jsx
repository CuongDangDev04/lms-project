import React from 'react';
import { ModalCustom } from '../../components/admin/ui/ModalCustom';
import { FaFileWord, FaTrash } from 'react-icons/fa';

const WordUploadModal = ({
  title, setTitle, classroomId, setClassroomId, duration, setDuration,
  startTime, setStartTime, deadline, setDeadline,
  hideResults, setHideResults, file, setFile,
  classrooms, loading, handleFileSubmit, handleFileChange, handleRemoveFile,
  isUploadOpen, setIsUploadOpen, showButton = true
}) => {
  return (
    <ModalCustom
      title="Tạo bài thi từ file Word"
      triggerText={showButton ? "Tạo bài thi từ file Word" : ""}
      triggerClass="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg font-semibold transform hover:-translate-y-1 text-sm sm:text-base flex items-center gap-2"
      open={isUploadOpen}
      onOpenChange={(open) => {
        setIsUploadOpen(open);
        if (!open) {
          setFile(null);
          setLoading(false);
          setDuration("");
          setStartTime("");
          setDeadline("");
          setHideResults(false);
        }
      }}
      triggerIcon={<FaFileWord />}
    >
      <form onSubmit={handleFileSubmit} className="space-y-6 mt-6">
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
                {classroom.class_name} - {classroom.course_name}
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
            required
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
        <div
          className="file-upload-container"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("dragover");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("dragover");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("dragover");
            handleFileChange({ target: { files: e.dataTransfer.files } });
          }}
        >
          <label className="file-upload-label">
            <FaFileWord />
            <p>Kéo và thả file Word tại đây</p>
            <span>hoặc nhấp để chọn file</span>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>
          {file && (
            <div className="file-preview">
              <span>{file.name}</span>
              <button type="button" onClick={handleRemoveFile} disabled={loading}>
                <FaTrash size={16} />
              </button>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 transition-all duration-300"
          disabled={loading || !file}
        >
          {loading ? "Đang tạo..." : "Tạo bài thi"}
        </button>
      </form>
    </ModalCustom>
  );
};

export default WordUploadModal;
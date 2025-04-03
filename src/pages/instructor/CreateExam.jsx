import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createExam, createExamFromWord, getClassRoomByTeacher, getExamsByClassroom } from '../../services/quizService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamFormModal from '../../components/academicAffairs/ExamFormModal';
import WordUploadModal from '../../components/academicAffairs/WordUploadModal';
import ExamPreviewModal from '../../components/academicAffairs/ExamPreviewModal';
import ExamList from '../../components/academicAffairs/ExamList';
import useUserId from '../../hooks/useUserId';
import NotificationService from '../../services/notificationService';
import LoadingBar from '../../components/users/LoadingBar';

const modalStyles = `
  .file-upload-container {
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    background-color: #f9fafb;
  }
  .file-upload-container.dragover {
    border-color: #f59e0b;
    background-color: #fef3c7;
  }
  .file-upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #4b5563;
    cursor: pointer;
  }
  .file-preview {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    background-color: #e5e7eb;
    border-radius: 4px;
  }
`;

const CreateExam = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hideResults, setHideResults] = useState(false);
  const [file, setFile] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examLoading, setExamLoading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExamFormOpen, setIsExamFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExamPreviewOpen, setIsExamPreviewOpen] = useState(false);
  const [createdExam, setCreatedExam] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showButton, setShowButton] = useState(false);

  const teacherId = useUserId();

  // Hàm lấy thời gian Việt Nam ở định dạng ISO 8601
  const getVietnamTime = () => {
    const vietnamTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    return new Date(vietnamTime).toISOString().replace('Z', '+07:00'); // Ví dụ: "2025-04-03T14:30:00+07:00"
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        if (!teacherId) {
          return;
        }
        const data = await getClassRoomByTeacher(teacherId);
        setClassrooms(data.data || []);
        console.log('Classrooms:', data.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học:', error);
        toast.error('Lỗi khi tải danh sách lớp học!');
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [teacherId]);

  useEffect(() => {
    const fetchExams = async () => {
      if (classroomId) {
        setExamLoading(true);
        try {
          const data = await getExamsByClassroom(classroomId);
          setExams(data || []);
          console.log('Exams:', data);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách bài thi:', error);
          toast.error('Lỗi khi tải danh sách bài thi!');
          setExams([]);
        } finally {
          setExamLoading(false);
        }
      } else {
        setExams([]);
      }
    };
    fetchExams();
  }, [classroomId]);

  const addQuestion = () => {
    setQuestions([...questions, {
      content: '',
      options: [
        { content: '', is_correct: false },
        { content: '', is_correct: false },
        { content: '', is_correct: false },
        { content: '', is_correct: false }
      ]
    }]);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(selectedFile);
    } else {
      toast.error('Vui lòng chọn file Word (.docx)!');
    }
  };

  const handleRemoveFile = () => setFile(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !classroomId || !duration || !deadline) {
      toast.error('Vui lòng nhập tiêu đề, thời gian làm bài và hạn chót!');
      return;
    }

    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      toast.error('Thời gian làm bài phải là số nguyên lớn hơn hoặc bằng 1 phút!');
      return;
    }

    // Lấy thời gian từ input (giờ cục bộ GMT+7)
    const startTimeLocal = startTime ? new Date(startTime) : new Date();
    const deadlineLocal = deadline ? new Date(deadline) : new Date();

    // Chuyển từ GMT+7 sang UTC (trừ 7 giờ)
    const startTimeUTC = new Date(startTimeLocal.getTime() - (7 * 60 * 60 * 1000)).toISOString();
    const deadlineUTC = new Date(deadlineLocal.getTime() - (7 * 60 * 60 * 1000)).toISOString();

    if (new Date(deadlineUTC) <= new Date(startTimeUTC)) {
      toast.error('Hạn chót phải sau thời gian bắt đầu!');
      return;
    }

    console.log('Dữ liệu gửi đi:', { startTime: startTimeLocal, startTimeUTC, deadline: deadlineLocal, deadlineUTC });

    setLoading(true);
    try {
      const examData = {
        title,
        classroom_id: parseInt(classroomId),
        questions,
        duration: parsedDuration,
        start_time: startTimeUTC,
        deadline: deadlineUTC,
        hide_results: Boolean(hideResults),
      };
      const response = await createExam(examData);
      toast.success('Tạo bài thi thành công!');
      setCreatedExam(response.exam);
      setIsPreviewOpen(true);
      setTitle('');
      setQuestions([]);
      setDuration('');
      setStartTime('');
      setDeadline('');
      setHideResults(false);
      setIsExamFormOpen(false);
    } catch (err) {
      console.error('Lỗi khi tạo bài thi:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi tạo bài thi!');
    } finally {
      setLoading(false);
    }
  };
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!title || !classroomId || !file || !duration || !deadline) {
      toast.error('Vui lòng nhập tiêu đề, thời gian làm bài, hạn chót và tải lên file Word!');
      return;
    }
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      toast.error('Thời gian làm bài phải là số nguyên lớn hơn hoặc bằng 1 phút!');
      return;
    }

    const startTimeValue = startTime ? new Date(startTime).toISOString().replace('Z', '+07:00') : getVietnamTime();
    const deadlineValue = new Date(deadline).toISOString().replace('Z', '+07:00');
    const currentTime = getVietnamTime();

    if (new Date(deadlineValue) <= new Date(startTimeValue || currentTime)) {
      toast.error('Hạn chót phải sau thời gian bắt đầu!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('classroom_id', parseInt(classroomId));
      formData.append('file', file);
      formData.append('duration', parsedDuration);
      formData.append('start_time', startTimeValue);
      formData.append('deadline', deadlineValue);
      formData.append('hide_results', hideResults.toString());
      console.log('Dữ liệu gửi đi (FormData):', { title, classroomId, duration, startTimeValue, deadlineValue }); // Log để kiểm tra
      const response = await createExamFromWord(formData);
      const notificationData = {
        classroom_id: classroomId,
        notificationType: "classroom",
        examTitle: title,
        action: 7,
      };
      await NotificationService.sendNotificationToCourseUsers(notificationData);
      toast.success('Tạo bài thi từ file Word thành công!');
      const examData = {
        title: response.exam.title,
        classroom_id: response.exam.classroom_id,
        Questions: response.exam.questions || [],
        duration: response.exam.duration,
        start_time: response.exam.start_time,
        deadline: response.exam.deadline,
        hide_results: response.exam.hide_results,
        exam_id: response.exam.exam_id,
      };

      console.log(examData)
      setCreatedExam(examData);
      setIsPreviewOpen(true);
      setTitle('');
      setFile(null);
      setDuration('');
      setStartTime('');
      setDeadline('');
      setHideResults(false);
      setIsUploadOpen(false);
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi tạo bài thi từ file Word!');
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setIsExamPreviewOpen(true);
  };

  const handleViewResults = () => {
    navigate(`/courseDetail/${classroomId}/exam-results/`);
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-full mx-auto">
        <LoadingBar isLoading={loading} />
        <style>{modalStyles}</style>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">
            Tạo bài thi mới
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsExamFormOpen(true)}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold text-sm"
            >
              Tạo bằng form
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold text-sm"
            >
              Tạo bằng file Word
            </button>
            <button
              onClick={handleViewResults}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold text-sm"
            >
              Xem kết quả thi
            </button>
          </div>
        </div>

        <ExamFormModal
          title={title}
          setTitle={setTitle}
          classroomId={classroomId}
          questions={questions}
          setQuestions={setQuestions}
          duration={duration}
          setDuration={setDuration}
          startTime={startTime}
          setStartTime={setStartTime}
          deadline={deadline}
          setDeadline={setDeadline}
          hideResults={hideResults}
          setHideResults={setHideResults}
          classrooms={classrooms}
          loading={loading}
          handleSubmit={handleSubmit}
          addQuestion={addQuestion}
          isOpen={isExamFormOpen && !loading}
          setIsOpen={setIsExamFormOpen}
          classRoomId={classroomId}
        />

        <WordUploadModal
          title={title}
          setTitle={setTitle}
          classroomId={classroomId}
          duration={duration}
          setDuration={setDuration}
          startTime={startTime}
          setStartTime={setStartTime}
          deadline={deadline}
          setDeadline={setDeadline}
          hideResults={hideResults}
          setHideResults={setHideResults}
          file={file}
          setFile={setFile}
          classrooms={classrooms}
          loading={loading}
          setLoading={setLoading}
          handleFileSubmit={handleFileSubmit}
          handleFileChange={handleFileChange}
          handleRemoveFile={handleRemoveFile}
          isUploadOpen={isUploadOpen && !loading}
          setIsUploadOpen={setIsUploadOpen}
          showButton={showButton}
          classRoomId={classroomId}
        />

        <ExamPreviewModal
          exam={createdExam}
          open={isPreviewOpen && !loading}
          onOpenChange={setIsPreviewOpen}
        />
        <ExamList exams={exams} examLoading={examLoading} handleExamClick={handleExamClick} />
        <ExamPreviewModal
          exam={selectedExam}
          open={isExamPreviewOpen && !loading}
          onOpenChange={setIsExamPreviewOpen}
        />

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          limit={1}
          theme="light"
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default CreateExam;
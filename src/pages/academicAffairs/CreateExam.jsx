import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { createExam, createExamFromWord, getAllClassrooms, getExamsByClassroom } from '../../services/quizService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ExamFormModal from '../../components/academicAffairs/ExamFormModal';
import WordUploadModal from '../../components/academicAffairs/WordUploadModal';
import ExamPreviewModal from '../../components/academicAffairs/ExamPreviewModal';
import ExamList from '../../components/academicAffairs/ExamList';

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
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [title, setTitle] = useState('');
  const [classroomId, setClassroomId] = useState('');
  const [filterClassroomId, setFilterClassroomId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState('');
  const [startTime, setStartTime] = useState('');
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

  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        const data = await getAllClassrooms();
        setClassrooms(data.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách lớp học:', error);
        toast.error('Lỗi khi tải danh sách lớp học!');
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      if (filterClassroomId) {
        setExamLoading(true);
        try {
          const data = await getExamsByClassroom(filterClassroomId);
          setExams(data);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách bài thi:', error);
          toast.error('Lỗi khi tải danh sách bài thi!');
        } finally {
          setExamLoading(false);
        }
      } else {
        setExams([]);
      }
    };
    fetchExams();
  }, [filterClassroomId]);

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
    if (!title || !classroomId || !duration) {
      toast.error('Vui lòng nhập tiêu đề, chọn lớp học và thời gian làm bài!');
      return;
    }
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      toast.error('Thời gian làm bài phải là số nguyên lớn hơn hoặc bằng 1 phút!');
      return;
    }
    if (questions.length === 0 || questions.every(q => !q.content)) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi!');
      return;
    }
    const hasValidOptions = questions.every(q => 
      q.options.some(opt => opt.is_correct) && 
      q.options.every(opt => opt.content.trim() !== '')
    );
    if (!hasValidOptions) {
      toast.error('Mỗi câu hỏi phải có ít nhất một lựa chọn đúng và các lựa chọn không được để trống!');
      return;
    }
    setLoading(true);
    try {
      console.log('Dữ liệu câu hỏi trước khi gửi:', questions);
      const examData = {
        title,
        classroom_id: parseInt(classroomId),
        questions,
        duration: parsedDuration,
        start_time: startTime || new Date().toISOString(),
        hide_results: Boolean(hideResults),
      };
      console.log('Dữ liệu gửi đi:', examData);
      const response = await createExam(examData);
      console.log('Response từ API:', response);
      toast.success('Tạo bài thi thành công!');
      setCreatedExam(response.exam);
      setIsPreviewOpen(true);
      setTitle('');
      setClassroomId('');
      setQuestions([]);
      setDuration('');
      setStartTime('');
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
    if (!title || !classroomId || !file || !duration) {
      toast.error('Vui lòng nhập tiêu đề, chọn lớp học, thời gian làm bài và tải lên file Word!');
      return;
    }
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      toast.error('Thời gian làm bài phải là số nguyên lớn hơn hoặc bằng 1 phút!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('classroom_id', parseInt(classroomId));
      formData.append('file', file);
      formData.append('duration', parsedDuration);
      formData.append('start_time', startTime || new Date().toISOString());
      formData.append('hide_results', hideResults.toString());
      const response = await createExamFromWord(formData);
      toast.success('Tạo bài thi từ file Word thành công!');
      const examData = {
        title: response.exam.title,
        classroom_id: response.exam.classroom_id,
        Questions: response.exam.questions || [],
        duration: response.exam.duration,
        start_time: response.exam.start_time,
        hide_results: response.exam.hide_results,
        exam_id: response.exam.exam_id,
      };
      setCreatedExam(examData);
      setIsPreviewOpen(true);
      setTitle('');
      setClassroomId('');
      setFile(null);
      setDuration('');
      setStartTime('');
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

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <style>{modalStyles}</style>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">
            Tạo bài thi mới
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsExamFormOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg font-semibold text-sm"
            >
              Tạo bằng form
            </button>
            <WordUploadModal
              title={title}
              setTitle={setTitle}
              classroomId={classroomId}
              setClassroomId={setClassroomId}
              duration={duration}
              setDuration={setDuration}
              startTime={startTime}
              setStartTime={setStartTime}
              hideResults={hideResults}
              setHideResults={setHideResults}
              file={file}
              setFile={setFile}
              classrooms={classrooms}
              loading={loading}
              handleFileSubmit={handleFileSubmit}
              handleFileChange={handleFileChange}
              handleRemoveFile={handleRemoveFile}
              isUploadOpen={isUploadOpen}
              setIsUploadOpen={setIsUploadOpen}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1.5">Chọn lớp học để xem bài thi</label>
          <select
            value={filterClassroomId}
            onChange={(e) => setFilterClassroomId(e.target.value)}
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

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-teal-500 h-2.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
          </div>
        )}

        <ExamFormModal
          title={title}
          setTitle={setTitle}
          classroomId={classroomId}
          setClassroomId={setClassroomId}
          questions={questions}
          setQuestions={setQuestions}
          duration={duration}
          setDuration={setDuration}
          startTime={startTime}
          setStartTime={setStartTime}
          hideResults={hideResults}
          setHideResults={setHideResults}
          classrooms={classrooms}
          loading={loading}
          handleSubmit={handleSubmit}
          addQuestion={addQuestion}
          isOpen={isExamFormOpen}
          setIsOpen={setIsExamFormOpen}
        />

        <ExamPreviewModal exam={createdExam} open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
        <ExamList exams={exams} examLoading={examLoading} handleExamClick={handleExamClick} />
        <ExamPreviewModal exam={selectedExam} open={isExamPreviewOpen} onOpenChange={setIsExamPreviewOpen} />

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
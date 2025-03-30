// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getExamDetails, submitExam, getResult } from "../../services/quizService";
// import { FaSpinner, FaArrowLeft, FaArrowRight } from "react-icons/fa";
// import useUserId from "../../hooks/useUserId";

// const TakeExamPage = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const [exam, setExam] = useState(null);
//   const [answers, setAnswers] = useState(() => {
//     const savedAnswers = localStorage.getItem(`exam_${examId}_answers`);
//     return savedAnswers ? JSON.parse(savedAnswers) : {};
//   });
//   const [currentPage, setCurrentPage] = useState(0);
//   const questionsPerPage = 1;
//   const [loading, setLoading] = useState(false);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(null);
//   const [isStarted, setIsStarted] = useState(false);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const userId = useUserId();

//   const checkExamAvailability = () => {
//     if (!exam?.start_time || !exam?.deadline) return false;
//     const currentTime = new Date();
//     const examStartTime = new Date(exam.start_time);
//     const examDeadline = new Date(exam.deadline);
//     return currentTime >= examStartTime && currentTime <= examDeadline;
//   };

//   useEffect(() => {
//     const fetchExamDetails = async () => {
//       setLoading(true);
//       try {
//         const resultData = await getResult(examId);
//         if (resultData) {
//           setHasSubmitted(true);
//           setTimeout(() => {
//             localStorage.removeItem(`exam_${examId}_startTime`);
//             localStorage.removeItem(`exam_${examId}_answers`);
//             navigate(`/exam/${examId}/result`);
//           }, 2000);
//           return;
//         }
//         const data = await getExamDetails(examId);
//         setExam(data);
//         const savedStartTime = localStorage.getItem(`exam_${examId}_startTime`);
//         if (savedStartTime && data) {
//           const startTime = parseInt(savedStartTime, 10);
//           const durationInSeconds = data.duration * 60;
//           const now = new Date().getTime();
//           const elapsed = Math.floor((now - startTime) / 1000);
//           const remaining = Math.max(durationInSeconds - elapsed, 0);
//           setTimeLeft(remaining);
//           setIsStarted(true);
//         }
//       } catch (error) {
//         if (error.response?.status === 404 && error.response?.data?.message === "Result not found") {
//           const data = await getExamDetails(examId);
//           setExam(data);
//           const savedStartTime = localStorage.getItem(`exam_${examId}_startTime`);
//           if (savedStartTime && data) {
//             const startTime = parseInt(savedStartTime, 10);
//             const durationInSeconds = data.duration * 60;
//             const now = new Date().getTime();
//             const elapsed = Math.floor((now - startTime) / 1000);
//             const remaining = Math.max(durationInSeconds - elapsed, 0);
//             setTimeLeft(remaining);
//             setIsStarted(true);
//           }
//         } else {
//           console.error("Lỗi khi tải chi tiết bài thi:", error);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchExamDetails();
//   }, [examId, navigate]);

//   useEffect(() => {
//     if (!isStarted || timeLeft === null || hasSubmitted) return;

//     const timer = setInterval(() => {
//       const savedStartTime = localStorage.getItem(`exam_${examId}_startTime`);
//       if (savedStartTime) {
//         const startTime = parseInt(savedStartTime, 10);
//         const durationInSeconds = exam.duration * 60;
//         const now = new Date().getTime();
//         const elapsed = Math.floor((now - startTime) / 1000);
//         const remaining = Math.max(durationInSeconds - elapsed, 0);
//         setTimeLeft(remaining);

//         // Nộp bài tự động khi hết thời gian
//         if (remaining === 0 && !submitLoading) {
//           handleSubmit(new Event("submit"));
//         }
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isStarted, timeLeft, exam, examId, submitLoading, hasSubmitted]);

//   useEffect(() => {
//     if (isStarted) {
//       localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
//     }
//   }, [answers, isStarted, examId]);

//   const startExam = () => {
//     if (exam) {
//       const startTime = new Date().getTime();
//       localStorage.setItem(`exam_${examId}_startTime`, startTime);
//       const durationInSeconds = exam.duration * 60;
//       setTimeLeft(durationInSeconds);
//       setIsStarted(true);
//     }
//   };

//   const continueExam = () => {
//     setIsStarted(true);
//   };

//   const handleBack = () => {
//     navigate(`/courseDetail/${exam.classroom_id}/list-exam`);
//   };

//   const totalQuestions = exam?.Questions?.length || 0;
//   const totalPages = useMemo(() => Math.ceil(totalQuestions / questionsPerPage), [totalQuestions]);

//   const handleOptionChange = (questionId, optionId) => {
//     setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitLoading || hasSubmitted) return;

//     setSubmitLoading(true);
//     try {
//       await submitExam(examId, userId, answers);
//       setHasSubmitted(true);
//       setTimeout(() => {
//         localStorage.removeItem(`exam_${examId}_startTime`);
//         localStorage.removeItem(`exam_${examId}_answers`);
//         navigate(`/exam/${examId}/result`);
//       }, 2000);
//     } catch (error) {
//       if (error.response?.status === 403 && error.response?.data?.message.includes("already submitted")) {
//         setHasSubmitted(true);
//         setTimeout(() => {
//           localStorage.removeItem(`exam_${examId}_startTime`);
//           localStorage.removeItem(`exam_${examId}_answers`);
//           navigate(`/exam/${examId}/result`);
//         }, 2000);
//       } else {
//         alert(error.message || "Có lỗi xảy ra khi nộp bài thi!");
//       }
//     } finally {
//       setSubmitLoading(false);
//     }
//   };

//   const handleNextPage = () => {
//     if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
//   };

//   const handlePrevPage = () => {
//     if (currentPage > 0) setCurrentPage(currentPage - 1);
//   };

//   const handleQuestionSelect = (index) => {
//     setCurrentPage(index);
//   };

//   const formatTime = (seconds) => {
//     if (seconds === null) return "Chưa bắt đầu";
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex items-center gap-3">
//           <FaSpinner className="animate-spin text-teal-400 text-3xl" />
//           <span className="text-gray-500">Đang tải bài thi...</span>
//         </div>
//       </div>
//     );
//   }

//   if (hasSubmitted) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 text-center max-w-md w-full">
//           <h1 className="text-xl sm:text-2xl font-medium text-gray-700 mb-4">Bạn đã làm bài thi này</h1>
//           <p className="text-gray-600">Đang chuyển hướng tới trang kết quả...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!exam || !exam.Questions || !exam.duration) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
//         <p className="text-red-500 text-center">Không thể tải bài thi hoặc dữ liệu không hợp lệ.</p>
//       </div>
//     );
//   }

//   const startIndex = currentPage * questionsPerPage;
//   const currentQuestions = exam.Questions.slice(startIndex, startIndex + questionsPerPage);
//   const isTimeUp = timeLeft === 0;

//   return (
//     <div className="min-h-screen mb-20 bg-gray-50 flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 pt-20">
//       {!isStarted ? (
//         <div className="flex-1 flex items-center justify-center py-6">
//           <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 text-center max-w-md w-full">
//             <h1 className="text-xl sm:text-2xl font-medium text-gray-700 mb-4">{exam.title}</h1>
//             <p className="text-gray-600 mb-4 sm:mb-6">Thời gian làm bài: {exam.duration} phút</p>
//             <p className="text-gray-600 mb-4 sm:mb-6">
//               Thời gian bắt đầu: {new Date(exam.start_time).toLocaleString("vi-VN", {
//                 dateStyle: "medium",
//                 timeStyle: "short",
//               })}
//             </p>
//             <p className="text-gray-600 mb-4 sm:mb-6">
//               Hạn chót: {new Date(exam.deadline).toLocaleString("vi-VN", {
//                 dateStyle: "medium",
//                 timeStyle: "short",
//               })}
//             </p>
//             {localStorage.getItem(`exam_${examId}_startTime`) ? (
//               <button
//                 onClick={continueExam}
//                 className="px-4 sm:px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto"
//               >
//                 Tiếp tục làm bài
//               </button>
//             ) : checkExamAvailability() ? (
//               <button
//                 onClick={startExam}
//                 className="px-4 sm:px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto"
//               >
//                 Làm bài
//               </button>
//             ) : (
//               <div className="space-y-4">
//                 <p className="text-red-500 font-medium">
//                   {new Date() > new Date(exam.deadline)
//                     ? "Đã quá hạn làm bài! Bạn không thể làm bài thi này nữa."
//                     : "Chưa tới thời gian làm bài. Vui lòng quay lại vào thời gian bắt đầu được quy định!"}
//                 </p>
//                 <button
//                   onClick={handleBack}
//                   className="px-4 sm:px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto"
//                 >
//                   Quay lại
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <>
//           <form
//             id="exam-form"
//             onSubmit={handleSubmit}
//             className={`flex-1 p-4 sm:p-6 ${submitLoading ? "pointer-events-none opacity-50" : ""}`}
//           >
//             <header className="bg-white shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 rounded-lg">
//               <h1 className="text-lg sm:text-xl font-medium text-gray-700 mb-2 sm:mb-0">{exam.title}</h1>
//               <p className="text-sm text-gray-600">Thời gian làm bài: {exam.duration} phút</p>
//             </header>
//             {isTimeUp && !submitLoading && (
//               <p className="text-red-500 text-center mb-4">Hết thời gian! Bài thi đã được nộp tự động.</p>
//             )}
//             {submitLoading && (
//               <p className="text-teal-500 text-center mb-4">Đang nộp bài thi...</p>
//             )}
//             <div className="space-y-6">
//               {currentQuestions.map((question, index) => (
//                 <div
//                   key={question.question_id}
//                   className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100"
//                 >
//                   <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-4">
//                     Câu {startIndex + index + 1}: {question.content}
//                   </h2>
//                   <div className="space-y-3">
//                     {question.options.length > 0 ? (
//                       question.options.map((option, optIndex) => (
//                         <label
//                           key={option.option_id}
//                           className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 ${
//                             answers[question.question_id] === option.option_id
//                               ? "bg-teal-50 border-teal-300"
//                               : "hover:bg-gray-50"
//                           }`}
//                         >
//                           <span className="text-sm font-medium text-gray-600">
//                             {String.fromCharCode(65 + optIndex)}.
//                           </span>
//                           <input
//                             type="radio"
//                             name={`question-${question.question_id}`}
//                             value={option.option_id}
//                             checked={answers[question.question_id] === option.option_id}
//                             onChange={() => handleOptionChange(question.question_id, option.option_id)}
//                             className="h-5 w-5 text-teal-500 focus:ring-teal-400 border-gray-300"
//                             disabled={isTimeUp || submitLoading}
//                           />
//                           <span className="text-sm text-gray-600">{option.content}</span>
//                         </label>
//                       ))
//                     ) : (
//                       <p className="text-gray-500">Không có lựa chọn nào cho câu hỏi này.</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="flex flex-col sm:flex-row justify-between mt-4 gap-4">
//               <button
//                 type="button"
//                 onClick={handlePrevPage}
//                 disabled={currentPage === 0 || isTimeUp || submitLoading}
//                 className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
//                   currentPage === 0 || isTimeUp || submitLoading
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:bg-teal-600"
//                 }`}
//               >
//                 <FaArrowLeft /> Câu trước
//               </button>
//               <button
//                 type="button"
//                 onClick={handleNextPage}
//                 disabled={currentPage === totalPages - 1 || isTimeUp || submitLoading}
//                 className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
//                   currentPage === totalPages - 1 || isTimeUp || submitLoading
//                     ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:bg-teal-600"
//                 }`}
//               >
//                 Câu sau <FaArrowRight />
//               </button>
//             </div>
//           </form>
//           <div className="w-full md:w-1/4 bg-teal-50 text-gray-700 p-4 md:p-6">
//             <div className="mb-4">
//               <h2 className="text-lg font-medium text-gray-600">Thời gian còn lại</h2>
//               <p className="text-xl sm:text-2xl font-bold text-teal-600">{formatTime(timeLeft)}</p>
//             </div>
//             <div className="mb-4">
//               <button
//                 type="submit"
//                 form="exam-form"
//                 className={`w-full px-4 sm:px-6 py-2 rounded-full text-white font-medium transition-all duration-300 ${
//                   submitLoading || isTimeUp
//                     ? "bg-gray-300 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600"
//                 }`}
//                 disabled={submitLoading || isTimeUp}
//               >
//                 {submitLoading ? "Đang nộp..." : "Nộp bài"}
//               </button>
//             </div>
//             <div>
//               <h2 className="text-lg font-medium text-gray-600 mb-2">Phiếu bài làm</h2>
//               <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 gap-2">
//                 {exam.Questions.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => handleQuestionSelect(index)}
//                     className={`p-2 rounded-full text-sm font-medium transition-all duration-200 ${
//                       index === currentPage
//                         ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
//                         : answers[exam.Questions[index].question_id]
//                         ? "bg-teal-200 text-teal-800"
//                         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//                     }`}
//                     disabled={isTimeUp || submitLoading}
//                   >
//                     {index + 1}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default TakeExamPage;





import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExamDetails, submitExam, getResult, saveExamProgress, getExamProgress } from "../../services/quizService";
import { FaSpinner, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useUserId from "../../hooks/useUserId";

const TakeExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 1;
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const userId = useUserId();

  const checkExamAvailability = () => {
    if (!exam?.start_time || !exam?.deadline) return false;
    const currentTime = new Date();
    const examStartTime = new Date(exam.start_time);
    const examDeadline = new Date(exam.deadline);
    return currentTime >= examStartTime && currentTime <= examDeadline;
  };

  // Tải chi tiết bài thi và kiểm tra trạng thái nộp bài
  useEffect(() => {
    const fetchExamDetailsAndProgress = async () => {
      setLoading(true);
      try {
        const resultData = await getResult(examId);
        if (resultData) {
          setHasSubmitted(true);
          setTimeout(() => navigate(`/exam/${examId}/result`), 2000);
          return;
        }
        const data = await getExamDetails(examId);
        setExam({ ...data, startTime: null });

        const progress = await getExamProgress(examId, userId);
        if (progress?.startTime) {
          const startTime = progress.startTime;
          const durationInSeconds = data.duration * 60;
          const now = new Date().getTime();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(durationInSeconds - elapsed, 0);
          setTimeLeft(remaining);
          setAnswers(progress.answers || {});
          setExam((prev) => ({ ...prev, startTime }));
          setIsStarted(true);
        }
      } catch (error) {
        if (error.response?.status === 404 && error.response?.data?.message === "Result not found") {
          const data = await getExamDetails(examId);
          setExam({ ...data, startTime: null });
          const progress = await getExamProgress(examId, userId);
          if (progress?.startTime) {
            const startTime = progress.startTime;
            const durationInSeconds = data.duration * 60;
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(durationInSeconds - elapsed, 0);
            setTimeLeft(remaining);
            setAnswers(progress.answers || {});
            setExam((prev) => ({ ...prev, startTime }));
            setIsStarted(true);
          }
        } else {
          console.error("Lỗi khi tải dữ liệu:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetailsAndProgress();
  }, [examId, userId, navigate]);

  // Điều khiển đồng hồ đếm ngược sau khi bắt đầu
  useEffect(() => {
    if (!isStarted || timeLeft === null || hasSubmitted || !exam?.startTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - exam.startTime) / 1000);
      const remaining = Math.max(exam.duration * 60 - elapsed, 0);
      setTimeLeft(remaining);

      if (remaining === 0 && !submitLoading) {
        handleSubmit(new Event("submit"));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeLeft, exam, examId, submitLoading, hasSubmitted]);

  // Lưu tiến trình khi answers thay đổi (chỉ gửi answers, không gửi lại startTime)
  useEffect(() => {
    if (isStarted && Object.keys(answers).length > 0) {
      const saveProgress = async () => {
        try {
          await saveExamProgress(examId, userId, { answers });
        } catch (error) {
          console.error("Lỗi khi lưu tiến trình:", error);
        }
      };
      saveProgress();
    }
  }, [answers, isStarted, examId, userId]);

  // Bắt đầu bài thi, chỉ gửi startTime
  const startExam = async () => {
    if (exam) {
      const startTime = new Date().getTime();
      try {
        await saveExamProgress(examId, userId, { startTime }); // Chỉ gửi startTime
        const durationInSeconds = exam.duration * 60;
        setTimeLeft(durationInSeconds);
        setExam((prev) => ({ ...prev, startTime }));
        setIsStarted(true);
      } catch (error) {
        console.error("Lỗi khi bắt đầu bài thi:", error);
        alert("Không thể bắt đầu bài thi. Vui lòng thử lại!");
      }
    }
  };

  const continueExam = () => {
    setIsStarted(true);
  };

  const handleBack = () => {
    navigate(`/courseDetail/${exam.classroom_id}/list-exam`);
  };

  const totalQuestions = exam?.Questions?.length || 0;
  const totalPages = useMemo(() => Math.ceil(totalQuestions / questionsPerPage), [totalQuestions]);

  const handleOptionChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading || hasSubmitted) return;

    setSubmitLoading(true);
    try {
      await submitExam(examId, userId, answers);
      setHasSubmitted(true);
      setTimeout(() => navigate(`/exam/${examId}/result`), 2000);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message.includes("already submitted")) {
        setHasSubmitted(true);
        setTimeout(() => navigate(`/exam/${examId}/result`), 2000);
      } else {
        alert(error.message || "Có lỗi xảy ra khi nộp bài thi!");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleQuestionSelect = (index) => {
    setCurrentPage(index);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "Chưa bắt đầu";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-teal-400 text-3xl" />
          <span className="text-gray-500">Đang tải bài thi...</span>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 text-center max-w-md w-full">
          <h1 className="text-xl sm:text-2xl font-medium text-gray-700 mb-4">Bạn đã làm bài thi này</h1>
          <p className="text-gray-600">Đang chuyển hướng tới trang kết quả...</p>
        </div>
      </div>
    );
  }

  if (!exam || !exam.Questions || !exam.duration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-red-500 text-center">Không thể tải bài thi hoặc dữ liệu không hợp lệ.</p>
      </div>
    );
  }

  const startIndex = currentPage * questionsPerPage;
  const currentQuestions = exam.Questions.slice(startIndex, startIndex + questionsPerPage);
  const isTimeUp = timeLeft === 0;

  return (
    <div className="min-h-screen mb-20 bg-gray-50 flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 pt-20">
      {!isStarted ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-100 text-center max-w-md w-full">
            <h1 className="text-xl sm:text-2xl font-medium text-gray-700 mb-4">{exam.title}</h1>
            <p className="text-gray-600 mb-4 sm:mb-6">Thời gian làm bài: {exam.duration} phút</p>
            <p className="text-gray-600 mb-4 sm:mb-6">
              Thời gian bắt đầu: {new Date(exam.start_time).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="text-gray-600 mb-4 sm:mb-6">
              Hạn chót: {new Date(exam.deadline).toLocaleString("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            {timeLeft !== null ? (
              <button
                onClick={continueExam}
                className="px-4 sm:px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto"
              >
                Tiếp tục làm bài
              </button>
            ) : checkExamAvailability() ? (
              <button
                onClick={startExam}
                className="px-4 sm:px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto"
              >
                Làm bài
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-red-500 font-medium">
                  {new Date() > new Date(exam.deadline)
                    ? "Đã quá hạn làm bài! Bạn không thể làm bài thi này nữa."
                    : "Chưa tới thời gian làm bài. Vui lòng quay lại vào thời gian bắt đầu được quy định!"}
                </p>
                <button
                  onClick={handleBack}
                  className="px-4 sm:px-6 py-2 rounded-full text-white font-medium bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600 transition-all duration-300 w-full sm:w-auto"
                >
                  Quay lại
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <form
            id="exam-form"
            onSubmit={handleSubmit}
            className={`flex-1 p-4 sm:p-6 ${submitLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            <header className="bg-white shadow-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 rounded-lg">
              <h1 className="text-lg sm:text-xl font-medium text-gray-700 mb-2 sm:mb-0">{exam.title}</h1>
              <p className="text-sm text-gray-600">Thời gian làm bài: {exam.duration} phút</p>
            </header>
            {isTimeUp && !submitLoading && (
              <p className="text-red-500 text-center mb-4">Hết thời gian! Bài thi đã được nộp tự động.</p>
            )}
            {submitLoading && (
              <p className="text-teal-500 text-center mb-4">Đang nộp bài thi...</p>
            )}
            <div className="space-y-6">
              {currentQuestions.map((question, index) => (
                <div
                  key={question.question_id}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100"
                >
                  <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-4">
                    Câu {startIndex + index + 1}: {question.content}
                  </h2>
                  <div className="space-y-3">
                    {question.options.length > 0 ? (
                      question.options.map((option, optIndex) => (
                        <label
                          key={option.option_id}
                          className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 ${
                            answers[question.question_id] === option.option_id
                              ? "bg-teal-50 border-teal-300"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <input
                            type="radio"
                            name={`question-${question.question_id}`}
                            value={option.option_id}
                            checked={answers[question.question_id] === option.option_id}
                            onChange={() => handleOptionChange(question.question_id, option.option_id)}
                            className="h-5 w-5 text-teal-500 focus:ring-teal-400 border-gray-300"
                            disabled={isTimeUp || submitLoading}
                          />
                          <span className="text-sm text-gray-600">{option.content}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-gray-500">Không có lựa chọn nào cho câu hỏi này.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-4 gap-4">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 0 || isTimeUp || submitLoading}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
                  currentPage === 0 || isTimeUp || submitLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:bg-teal-600"
                }`}
              >
                <FaArrowLeft /> Câu trước
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1 || isTimeUp || submitLoading}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full sm:w-auto ${
                  currentPage === totalPages - 1 || isTimeUp || submitLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:bg-teal-600"
                }`}
              >
                Câu sau <FaArrowRight />
              </button>
            </div>
          </form>
          <div className="w-full md:w-1/4 bg-teal-50 text-gray-700 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-600">Thời gian còn lại</h2>
              <p className="text-xl sm:text-2xl font-bold text-teal-600">{formatTime(timeLeft)}</p>
            </div>
            <div className="mb-4">
              <button
                type="submit"
                form="exam-form"
                className={`w-full px-4 sm:px-6 py-2 rounded-full text-white font-medium transition-all duration-300 ${
                  submitLoading || isTimeUp
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-400 to-blue-600 hover:bg-teal-600"
                }`}
                disabled={submitLoading || isTimeUp}
              >
                {submitLoading ? "Đang nộp..." : "Nộp bài"}
              </button>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-600 mb-2">Phiếu bài làm</h2>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {exam.Questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionSelect(index)}
                    className={`p-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      index === currentPage
                        ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                        : answers[exam.Questions[index].question_id]
                        ? "bg-teal-200 text-teal-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    disabled={isTimeUp || submitLoading}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TakeExamPage;
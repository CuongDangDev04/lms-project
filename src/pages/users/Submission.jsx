import React, { useState, useEffect } from "react";
import {
  submitAssignment,
  getSubmissionsByAssignment,
  downloadSubmissionFiles,
  gradeSubmission,
  deleteSubmission,
} from "../../services/SubmissionService";
import { ModalCustom } from "../../components/admin/ui/ModalCustom";
import NotificationService from "../../services/notificationService";
import { useParams } from "react-router-dom";

const Submission = ({ assignmentId, userId, userRole = "student", deadline, assignmentTitle }) => {
  const [files, setFiles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState(null);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);
  const classRoomId = useParams()
  useEffect(() => {
    document.title = "Nộp bài - BrainHub";
    fetchSubmissions();
  }, [assignmentId]);
  const fetchSubmissions = async () => {
    try {
      const result = await getSubmissionsByAssignment(assignmentId);
      setSubmissions(result.submissions || []);
    } catch (error) {
      setMessage("Không thể tải danh sách bài nộp.");
    }
  };

  const isDeadlinePassed = () => new Date(deadline) < new Date();
  const userSubmission = submissions.find((sub) => sub.user_id === userId);

  // Xử lý xác nhận chấm điểm
  const handleGradeConfirm = async () => {
    try {
      await gradeSubmission(submissionToGrade, parseFloat(score), feedback);
      const gradedSubmission = submissions.find((sub) => sub.submission_id === submissionToGrade);
      const studentUserId = gradedSubmission.user_id; // Lấy user_id của học sinh

      setSubmissions(
        submissions.map((sub) =>
          sub.submission_id === submissionToGrade
            ? { ...sub, status: "graded", grade: { score, feedback } }
            : sub
        )
      );
      setGradingSubmissionId(null);
      setScore("");
      setFeedback("");

      const notificationData = {
        target_user_id: studentUserId, // Sử dụng user_id của học sinh
        notificationType: "classroom",
        message: `Giảng viên chấm điểm thành công cho bạn`,
      };
      await NotificationService.sendNotificationToSpecificUser(notificationData);
      setMessage("Chấm điểm thành công!");
    } catch (error) {
      setMessage("Lỗi khi chấm điểm: " + error.message);
    } finally {
      setIsGradeModalOpen(false);
      setSubmissionToGrade(null);
    }
  };
  // Xử lý mở modal xác nhận nộp bài
  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!files.length) {
      setMessage("Vui lòng chọn file để nộp.");
      return;
    }
    if (isDeadlinePassed()) {
      setMessage("Hết hạn nộp bài!");
      return;
    }
    if (userSubmission) {
      setMessage("Bạn đã nộp bài rồi!");
      return;
    }
    setIsSubmitModalOpen(true);
  };

  // Xử lý xác nhận nộp bài
  const handleSubmitConfirm = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitAssignment(assignmentId, userId, files);
      // Giả định server trả về thông tin bài nộp đầy đủ trong result.submission
      const newSubmission = {
        ...result.submission,
        user_id: userId, // Đảm bảo có user_id
        status: "pending",
        submitted_at: new Date().toISOString(), // Thời gian hiện tại
        grade: null, // Chưa chấm điểm
      };
      setSubmissions((prev) => [...prev, newSubmission]); // Cập nhật danh sách ngay lập tức
      setFiles([]); // Xóa danh sách file đã chọn

      const notificationData = {
        classroom_id: classRoomId.classroomId, // Sử dụng user_id của học sinh
        notificationType: "classroom",
        message: `Sinh viên đã nộp bài`,
      };
      await NotificationService.sendNotificationToClassroomTeachers(notificationData);
      setMessage("Nộp bài thành công!");
    } catch (error) {
      setMessage("Lỗi khi nộp bài: " + error.message);
    } finally {
      setIsSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  const handleStartGrading = (submissionId) => {
    setGradingSubmissionId(submissionId);
    setScore("");
    setFeedback("");
  };

  // Xử lý mở modal xác nhận chấm điểm
  const handleGradeClick = (submissionId) => {
    if (!score || isNaN(score) || score < 0 || score > 10) {
      setMessage("Điểm phải từ 0 đến 10.");
      return;
    }
    setSubmissionToGrade(submissionId);
    setIsGradeModalOpen(true);
  };



  const handleCancelGrading = () => {
    setGradingSubmissionId(null);
    setScore("");
    setFeedback("");
  };

  const handleDownload = async (submissionId) => {
    try {
      await downloadSubmissionFiles(submissionId);
      setMessage("Tải file thành công!");
    } catch (error) {
      setMessage("Lỗi khi tải file: " + error.message);
    }
  };

  // Xử lý mở modal xác nhận xóa bài nộp
  const handleDeleteClick = (submissionId) => {
    setSubmissionToDelete(submissionId);
    setIsDeleteModalOpen(true);
  };

  // Xử lý xác nhận xóa bài nộp
  const handleDeleteConfirm = async () => {
    try {
      await deleteSubmission(submissionToDelete);
      setSubmissions(submissions.filter((sub) => sub.submission_id !== submissionToDelete));
      setMessage("Xóa bài nộp thành công!");
    } catch (error) {
      setMessage("Lỗi khi xóa bài nộp: " + error.message);
    } finally {
      setIsDeleteModalOpen(false);
      setSubmissionToDelete(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h3 className="text-2xl font-semibold text-blue-500 mb-6">
        {userRole === "student" ? "Nộp bài" : "Quản lý bài nộp"} - {assignmentTitle}
      </h3>
      {message && (
        <p
          className={`mb-6 text-sm text-center font-medium py-2 px-4 rounded-full shadow-sm ${message.includes("Lỗi") ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"
            }`}
        >
          {message}
        </p>
      )}

      {/* Học sinh */}
      {userRole === "student" && (
        <div className="space-y-6">
          {userSubmission ? (
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="text-sm text-gray-600">
                Trạng thái:{" "}
                <span
                  className={`font-semibold ${userSubmission.status === "pending" ? "text-blue-500" : "text-green-500"
                    }`}
                >
                  {userSubmission.status === "pending" ? "Đã nộp" : "Đã chấm"}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Thời gian nộp: {new Date(userSubmission.submitted_at).toLocaleString()}
              </p>
              {userSubmission.status === "graded" && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Điểm: <span className="font-bold text-blue-500 text-lg">{userSubmission.grade.score}/10</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Nhận xét: <span className="italic text-gray-700">{userSubmission.grade.feedback || "Không có"}</span>
                  </p>
                </div>
              )}
              <button
                onClick={() => handleDownload(userSubmission.submission_id)}
                className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105"
              >
                Tải file đã nộp
              </button>
            </div>
          ) : isDeadlinePassed() ? (
            <p className="text-red-500 text-center font-medium bg-red-100 py-3 rounded-full shadow-sm">
              Hết hạn nộp bài!
            </p>
          ) : (
            <form onSubmit={handleSubmitClick} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chọn file bài nộp</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  className="mt-2 w-full p-3 border border-gray-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-500 hover:file:bg-blue-100 shadow-sm transition-all duration-300"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md flex items-center justify-center transform hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Đang nộp...
                  </>
                ) : (
                  "Nộp bài"
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Modal xác nhận nộp bài */}
      <ModalCustom
        title="Xác nhận nộp bài"
        open={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
      >
        <div className="text-gray-700">
          <p>Bạn có chắc muốn nộp bài tập này không? Sau khi nộp, bạn không thể chỉnh sửa.</p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitConfirm}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Nộp
            </button>
          </div>
        </div>
      </ModalCustom>

      {/* Giáo viên */}
      {userRole === "teacher" && (
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-700">Danh sách bài nộp của học sinh</h4>
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl shadow-sm">
              Chưa có bài nộp nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-md">
                <thead className="bg-blue-500 text-white sticky top-0">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold">ID Học sinh</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Thời gian nộp</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Điểm</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Nhận xét</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr
                      key={sub.submission_id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="py-4 px-6 text-sm text-gray-700">{sub.user_id}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${sub.status === "pending" ? "bg-blue-100 text-blue-500" : "bg-green-100 text-green-500"
                            }`}
                        >
                          {sub.status === "pending" ? "Chưa chấm" : "Đã chấm"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {sub.status === "graded" ? (
                          <span className="font-bold text-blue-500">{sub.grade.score}/10</span>
                        ) : gradingSubmissionId === sub.submission_id ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="w-20 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-300"
                            placeholder="0-10"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {sub.status === "graded" ? (
                          <span className="italic text-gray-600">{sub.grade.feedback || "Không có"}</span>
                        ) : gradingSubmissionId === sub.submission_id ? (
                          <input
                            type="text"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-300"
                            placeholder="Nhận xét"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm flex space-x-3">
                        {sub.status === "pending" && gradingSubmissionId !== sub.submission_id ? (
                          <button
                            onClick={() => handleStartGrading(sub.submission_id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105"
                          >
                            Chấm điểm
                          </button>
                        ) : gradingSubmissionId === sub.submission_id ? (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleGradeClick(sub.submission_id)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105"
                            >
                              Xác nhận
                            </button>
                            <button
                              onClick={handleCancelGrading}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all duration-300 shadow-md"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : null}
                        <button
                          onClick={() => handleDownload(sub.submission_id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-300 shadow-md transform hover:scale-105"
                        >
                          Tải
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sub.submission_id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 shadow-md transform hover:scale-105"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal xác nhận chấm điểm */}
      <ModalCustom
        title="Xác nhận chấm điểm"
        open={isGradeModalOpen}
        onOpenChange={setIsGradeModalOpen}
      >
        <div className="text-gray-700">
          <p>Bạn có chắc muốn chấm điểm bài nộp này với điểm số {score} và nhận xét "{feedback}" không?</p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsGradeModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleGradeConfirm}
              className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Chấm
            </button>
          </div>
        </div>
      </ModalCustom>

      {/* Modal xác nhận xóa bài nộp */}
      <ModalCustom
        title="Xác nhận xóa bài nộp"
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      >
        <div className="text-gray-700">
          <p>Bạn có chắc muốn xóa bài nộp này không? Hành động này không thể hoàn tác.</p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Xóa
            </button>
          </div>
        </div>
      </ModalCustom>
    </div>
  );
};

export default Submission;
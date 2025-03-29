import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClassService from "../../services/ClassService";
import Notifications from "../../components/users/Notification";

const ClassDetail = () => {
  const { classroomId } = useParams(); // Lấy classId từ URL
  const [userId, setUserId] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?.id);
    } else {
      setError("Không tìm thấy thông tin người dùng!");
    }
  }, []);
  useEffect(() => {
    document.title = "Chi tiết lớp học - BrainHub";
    if (!userId) return;
    const fetchClassInfo = async () => {
      try {
        const response = await ClassService.getClassInfo(classroomId);
        setClassInfo(response.classInfo);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin lớp học!");
      }
    };

    fetchClassInfo();
  }, [classroomId, userId]);
  useEffect(() => {
  }, [userId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!classInfo) return <p>Đang tải...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="hehe m-9">
        <Notifications />
      </div>
      <h1 className="text-xl font-bold mb-4">{classInfo.Class.class_name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          key={classInfo.Course.course_id}
          className="p-4 bg-white shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition"
        >
          <h2 className="text-lg font-semibold">
            {classInfo.Course.course_name}
          </h2>
          <p className="text-gray-600">{classInfo.Course.description}</p>
          <p className="text-gray-500 text-sm">
            Ngày tạo: {classInfo.Course.creation_date}
          </p>
        </div>
      </div>
      {/* <ChatBox userId={userId} /> */}
      <button onClick={() => navigate(`/classroom/${classroomId}`)}>
        vào lớp
      </button>
    </div>
  );
};

export default ClassDetail;

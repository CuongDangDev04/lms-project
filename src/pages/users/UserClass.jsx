import React, { useEffect, useState } from "react";
import ClassService from "../../services/ClassService";
import { useNavigate } from "react-router-dom";

const UserClass = () => {
  const [userId, setUserId] = useState(null);
  const [classrooms, setClassrooms] = useState([]); // ✅ Sửa tên biến để phản ánh đúng dữ liệu API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?.id);
    } else {
      setError("Không tìm thấy thông tin người dùng!");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return; // 🛑 Không gọi API nếu userId chưa có
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const data = await ClassService.getAllClassOfUser(userId);
        setClassrooms(data?.classCourseOfUser?.Classrooms || []); // ✅ Lấy danh sách Classrooms
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin lớp học!");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [userId]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl font-bold mb-4">Danh sách lớp học</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms.length > 0 ? (
          classrooms.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-white shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition"
              onClick={() => navigate(`/class/${item.classroom_id}`)}
            >
              <h2 className="text-lg font-semibold">
                {item?.Class?.class_name || "Không có tên lớp"}
              </h2>
              <p className="text-gray-600">
                {item?.Course?.course_name || "Không có tên khóa học"}
              </p>
              <p className="text-gray-500 text-sm">
                {item?.Course?.description || "Không có mô tả"}
              </p>
            </div>
          ))
        ) : (
          <p>Không có lớp học nào.</p>
        )}
      </div>
    </div>
  );
};

export default UserClass;

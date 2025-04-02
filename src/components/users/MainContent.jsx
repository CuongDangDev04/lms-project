import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getScheduleToday } from "../../services/scheduleServices";
import { getPendingAssignments } from "../../services/assignmentService";

const MainContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState("");
  const [roleId, setRoleId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [classesToday, setClassesToday] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUserName(userData.fullname || "Người dùng");
      setRoleId(userData.role_id || null);
      setUserId(userData.id || null);
    } else {
      setUserName("Người dùng");
      setRoleId(null);
      setUserId(null);
    }

    const fetchClassesToday = async () => {
      try {
        setLoading(true);
        const data = await getScheduleToday();
        console.log('hehe,', data);

        // Chuẩn hóa dữ liệu
        const normalizedData = data.map(item => ({
          ...item,
          user_participation: {
            classroom_id: item.classroom_id
          }
        }));

        setClassesToday(normalizedData);
      } catch (error) {
        console.error("Lỗi trong component khi lấy lịch học:", error);
        setClassesToday([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingAssignments = async () => {
      if (userData && userData.role_id === 1 && userData.id) {
        console.log("userData.id", userData.id);
        try {
          setAssignmentLoading(true);
          const data = await getPendingAssignments();
          setPendingAssignments(data);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách bài tập chưa làm:", error);
          setPendingAssignments([]);
        } finally {
          setAssignmentLoading(false);
        }
      }
    };

    fetchClassesToday();
    fetchPendingAssignments();
  }, []);

  const renderTable = (id, title, data, headers, fields, index) => (
    <div id={id} className={index === 0 ? "" : "mt-6"}>
      <h4 className="text-gray-800 font-semibold mb-4">
        {title} • {data.length}
      </h4>
      <div className="bg-white p-4 rounded-xl shadow-lg w-full overflow-x-auto">
        <div
          className={`grid ${id === "pending-assignments" ? "grid-cols-5" : "grid-cols-3"} bg-gray-100 p-2 rounded-lg text-gray-700 text-sm font-semibold min-w-[600px]`}
        >
          {headers.map((header, headerIndex) => (
            <span key={headerIndex} className="text-center">{header}</span>
          ))}
        </div>
        {loading && id === "class-today" ? (
          <div className="p-4 text-center text-gray-500">Đang tải lịch học...</div>
        ) : assignmentLoading && id === "pending-assignments" ? (
          <div className="p-4 text-center text-gray-500">Đang tải bài tập...</div>
        ) : data.length > 0 ? (
          data.map((item) => {
            const isOverdue =
              item.end_assignment && new Date(item.end_assignment) < new Date();

            return (
              <Link
                to={`/courseDetail/${item.user_participation?.classroom_id}/assignments`}
                key={id === "pending-assignments" ? item.assignment_id : item.schedule_id}
                className={`grid ${id === "pending-assignments" ? "grid-cols-5" : "grid-cols-3"} bg-gray-50 p-3 rounded-lg hover:bg-blue-400 hover:text-white items-center min-w-[600px] mt-2 transition cursor-pointer`}
              >
                {fields.map((field, fieldIndex) => (
                  <span key={fieldIndex} className="text-center text-sm font-medium">
                    {field === "end_assignment" && item[field]
                      ? new Date(item[field]).toLocaleString()
                      : field === "user_participation.Classroom.Class.class_name"
                        ? `${item.user_participation?.Classroom?.Class?.class_name} - ${item.user_participation?.Classroom?.Course?.course_name}` || "N/A"
                        : field === "status"
                          ? isOverdue
                            ? <span className="text-white bg-red-500 p-2 rounded-xl font-bold">Quá hạn</span>
                            : <span className="text-white bg-green-500 p-2 rounded-xl font-bold">Còn hạn</span>
                          : item[field] || "N/A"}
                  </span>
                ))}
              </Link>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">
            {id === "class-today"
              ? roleId === 1
                ? "Không có lịch học hôm nay"
                : "Không có lịch dạy hôm nay"
              : "Không có bài tập nào chưa làm"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`p-4 min-h-screen pb-20 overflow-y-auto w-full}`}>
      <h3 className="text-blue-500 text-xl font-semibold">
        Chào mừng đã quay trở lại, {userName} 👋
      </h3>
      <hr className="border-gray-300 border-t-2 my-4" />
      <h1 className="text-3xl text-center text-yellow-500 font-semibold my-5">
        {roleId === 1 ? "Lớp học trực tuyến" : "Lịch dạy trực tuyến"}
      </h1>
      {roleId === 1 ? (
        [
          [
            "class-today",
            "📅 Lịch học hôm nay",
            classesToday,
            ["⏰ Thời gian", "📚 Khóa học", "🏫 Lớp học"], // Thống nhất cột
            ["time", "subject", "class"], // Thống nhất trường dữ liệu
          ],
          [
            "pending-assignments",
            "📝 Bài tập chưa làm",
            pendingAssignments,
            ["📚 Tiêu đề", "📋 Mô tả", "⏰ Hạn nộp", "🏫 Lớp", "📅 Trạng thái"],
            ["title", "description", "end_assignment", "user_participation.Classroom.Class.class_name", "status"],
          ],
        ].map((tableData, tableIndex) => (
          <div key={tableIndex}>{renderTable(...tableData, tableIndex)}</div>
        ))
      ) : roleId === 2 ? (
        [
          [
            "class-today",
            "📅 Lịch dạy hôm nay",
            classesToday,
            ["⏰ Thời gian", "📚 Khóa học", "🏫 Lớp học"], // Thống nhất cột
            ["time", "subject", "class"], // Thống nhất trường dữ liệu
          ],
        ].map((tableData, tableIndex) => (
          <div key={tableIndex}>{renderTable(...tableData, tableIndex)}</div>
        ))
      ) : (
        <div className="text-center text-gray-600">
          Vai trò người dùng không xác định.
        </div>
      )}
    </div>
  );
};

export default MainContent;
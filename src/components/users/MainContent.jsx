import { useState, useEffect } from "react";
import { getScheduleToday } from "../../services/scheduleServices";

const MainContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState("");
  const [roleId, setRoleId] = useState(null); // Thêm state để lưu role_id
  const [classesToday, setClassesToday] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Lấy fullname và role_id từ localStorage
      setUserName(userData.fullname || "Người dùng");
      setRoleId(userData.role_id || null);
    } else {
      setUserName("Người dùng");
      setRoleId(null);
    }

    const fetchClassesToday = async () => {
      try {
        setLoading(true);
        const data = await getScheduleToday();
        setClassesToday(data);
      } catch (error) {
        console.error("Lỗi trong component khi lấy lịch học:", error);
        setClassesToday([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassesToday();
  }, []);

  const renderTable = (id, title, data, headers, fields, index) => (
    <div id={id} className={index === 0 ? "" : "mt-6"}>
      <h4 className="text-gray-800 font-semibold mb-4">
        {title} • {data.length}
      </h4>
      <div className="bg-white p-4 rounded-xl shadow-lg w-full overflow-x-auto">
        <div className="grid grid-cols-3 bg-gray-100 p-2 rounded-lg text-gray-700 text-sm font-semibold min-w-[600px]">
          {headers.map((header, headerIndex) => (
            <span key={headerIndex} className="text-center">{header}</span>
          ))}
        </div>
        {loading && id === "class-today" ? (
          <div className="p-4 text-center text-gray-500">Đang tải lịch học...</div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <div
              key={item.schedule_id}
              className="grid grid-cols-3 bg-gray-50 p-3 rounded-lg hover:bg-blue-400 hover:text-white items-center min-w-[600px] mt-2 transition"
            >
              {fields.map((field, fieldIndex) => (
                <span key={fieldIndex} className="text-center text-sm font-medium">
                  {item[field]}
                </span>
              ))}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            {roleId === 1 ? "Không có lịch học hôm nay" : "Không có lịch dạy hôm nay"}
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
        // Hiển thị lịch học cho sinh viên (role_id = 1)
        [
          [
            "class-today",
            "📅 Lịch học hôm nay",
            classesToday,
            ["⏰ Thời gian", "🏫 Lớp học", "📌 Trạng thái"],
            ["time", "class", "type"],
          ],
        ].map((tableData, tableIndex) => (
          <div key={tableIndex}>{renderTable(...tableData, tableIndex)}</div>
        ))
      ) : roleId === 2 ? (
        // Hiển thị lịch dạy cho giảng viên (role_id = 2)
        [
          [
            "class-today",
            "📅 Lịch dạy hôm nay",
            classesToday,
            ["⏰ Thời gian", "📚 Khóa học", "🏫 Lớp học"],
            ["time", "course_name", "class"],
          ],
        ].map((tableData, tableIndex) => (
          <div key={tableIndex}>{renderTable(...tableData, tableIndex)}</div>
        ))
      ) : (
        // Trường hợp role_id không xác định
        <div className="text-center text-gray-600">
          Vai trò người dùng không xác định.
        </div>
      )}
    </div>
  );
};

export default MainContent;
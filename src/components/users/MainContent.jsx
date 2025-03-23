import { useState, useEffect } from "react";
import { getScheduleToday } from '../../services/scheduleServices';

const MainContent = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [userName, setUserName] = useState("");
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
        if (userData && userData.fullname) {
            setUserName(userData.fullname);
        } else {
            setUserName("Người dùng");
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
                    <div className="p-4 text-center text-gray-500">Không có lịch học hôm nay</div>
                )}
            </div>
        </div>
    );

    return (
        <div className={`p-4 min-h-screen pb-20 overflow-y-auto w-fulL}`}>
            <h3 className="text-blue-500 text-xl font-semibold">
                Chào mừng đã quay trở lại, {userName} 👋
            </h3>
            <hr className="border-gray-300 border-t-2 my-4" />
            <h1 className="text-3xl text-center text-yellow-500 font-semibold my-5">Lớp học trực tuyến</h1>

            {[
                ["class-today", "📅 Lịch học hôm nay", classesToday, ["⏰ Thời gian", "🏫 Lớp học", "📌 Trạng thái"], ["time", "class", "type"]],
                // Các bảng khác nếu cần
            ].map((tableData, tableIndex) => (
                <div key={tableIndex}>
                    {renderTable(...tableData, tableIndex)}
                </div>
            ))}
        </div>
    );
};

export default MainContent;
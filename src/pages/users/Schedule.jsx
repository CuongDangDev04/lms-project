import { useState, useEffect } from "react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/vi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SideBarMobile from "../../components/users/SideBarMobile";
import { getSchedule } from "../../services/scheduleServices";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale("vi");

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");

  const fetchSchedule = async () => {
    if (!token) {
      setError("Vui lòng đăng nhập để xem lịch học");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getSchedule(token);
      setScheduleData(data);
    } catch (err) {
      setError("Không thể tải lịch học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Lịch Học - BrainHub";
    fetchSchedule();
  }, []);

  const handlePrev = () => setCurrentDate(currentDate.subtract(1, "week"));
  const handleNext = () => setCurrentDate(currentDate.add(1, "week"));
  const handleToday = () => setCurrentDate(dayjs());
  const handleDateChange = (e) => {
    const selectedDate = dayjs(e.target.value);
    if (selectedDate.isValid()) {
      setCurrentDate(selectedDate.startOf("week"));
    }
  };

  const startOfWeek = currentDate.startOf("week");
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

  return (
    <div className="p-8 bg-gray-50 min-h-screen mt-16 font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          Lịch Học Theo Tuần
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToday}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 text-[14px] font-semibold"
          >
            Hôm Nay
          </button>
          <input
            type="date"
            onChange={handleDateChange}
            className="p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-sm"
            defaultValue={currentDate.format("YYYY-MM-DD")}
          />
          <button
            onClick={handlePrev}
            className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 bg-white text-gray-600 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-gray-600 animate-pulse text-lg font-medium bg-white p-3 rounded-lg shadow-md">
          Đang tải lịch học...
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 font-semibold text-lg bg-white p-3 rounded-lg shadow-md">
          {error}
        </div>
      )}

      {/* Schedule Table */}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg shadow-md bg-white mb-10">
          <table className="w-full border-collapse text-sm">
            <colgroup>
              <col className="w-20" />
              <col className="min-w-36" span="7" />
            </colgroup>

            {/* Table Header */}
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border-b border-blue-700 p-3 text-center font-semibold text-base">
                  Ca Học
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.format("YYYY-MM-DD")}
                    className="border-b border-blue-700 p-3 text-center font-semibold text-base"
                  >
                    <div className="capitalize truncate">{day.format("dddd")}</div>
                    <div className="text-blue-100 text-xs">{day.format("DD/MM/YYYY")}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {["morning", "afternoon", "evening"].map((timeSlot) => (
                <tr key={timeSlot} className="hover:bg-gray-50 transition-all duration-200">
                  <td className="border-b p-3 bg-blue-50 text-center font-medium text-gray-700 text-base">
                    {timeSlot === "morning" ? "Sáng" : timeSlot === "afternoon" ? "Chiều" : "Tối"}
                  </td>
                  {weekDays.map((day) => {
                    const dayKey = day.format("YYYY-MM-DD");
                    const events = scheduleData[dayKey]?.filter((e) => e.session === timeSlot) || [];
                    return (
                      <td key={dayKey} className="border-b p-3 align-top h-32">
                        {events.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            {events.map((event, index) => {
                              // Tách từng trường hợp
                              const isNormalLesson =
                                event.event_type === "Học" &&
                                event.is_postponed === false &&
                                !event.parent_schedule_id;
                              const isPostponedLesson =
                                event.event_type === "Học" && event.is_postponed === true;
                              const isMakeupLesson =
                                event.event_type === "Học" && event.parent_schedule_id != null;
                              const isNormalExam =
                                event.event_type === "Thi" &&
                                event.is_postponed === false &&
                                !event.parent_schedule_id;
                              const isPostponedExam =
                                event.event_type === "Thi" && event.is_postponed === true;
                              const isMakeupExam =
                                event.event_type === "Thi" && event.parent_schedule_id != null;

                              // Xác định màu và nhãn
                              let bgColor = "bg-white";
                              let textColor = "text-gray-800";
                              let borderColor = "border-gray-200";
                              let tagBgColor = "bg-gray-500";
                              let tagText = "Không xác định";

                              if (isNormalLesson) {
                                bgColor = "bg-white";
                                textColor = "text-gray-800";
                                borderColor = "border-gray-200";
                                tagBgColor = "bg-blue-500";
                                tagText = "Học";
                              } else if (isPostponedLesson) {
                                bgColor = "bg-red-50";
                                textColor = "text-red-900";
                                borderColor = "border-red-200";
                                tagBgColor = "bg-red-500";
                                tagText = "Hoãn";
                              } else if (isMakeupLesson) {
                                bgColor = "bg-blue-50";
                                textColor = "text-blue-900";
                                borderColor = "border-blue-200";
                                tagBgColor = "bg-blue-600";
                                tagText = "Bù";
                              } else if (isNormalExam) {
                                bgColor = "bg-yellow-50";
                                textColor = "text-yellow-900";
                                borderColor = "border-yellow-200";
                                tagBgColor = "bg-yellow-500";
                                tagText = "Thi";
                              } else if (isPostponedExam) {
                                bgColor = "bg-orange-50";
                                textColor = "text-orange-900";
                                borderColor = "border-orange-200";
                                tagBgColor = "bg-orange-500";
                                tagText = "Thi (Hoãn)";
                              } else if (isMakeupExam) {
                                bgColor = "bg-green-50";
                                textColor = "text-blue-900";
                                borderColor = "border-blue-200";
                                tagBgColor = "bg-blue-600";
                                tagText = "Thi (Bù)";
                              }

                              return (
                                <div
                                  key={index}
                                  className={`relative p-3 rounded-lg text-sm shadow-md border transition-all duration-300 hover:shadow-lg h-full flex flex-col justify-between ${bgColor} ${textColor} ${borderColor}`}
                                >
                                  {/* Tag - Top Left */}
                                  <div className="absolute top-1 left-1">
                                    <span
                                      className={`${tagBgColor} text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm`}
                                    >
                                      {tagText}
                                    </span>
                                  </div>

                                  {/* Thông tin chính */}
                                  <div className="mt-6 space-y-1">
                                    <div className="font-bold text-sm truncate">{event.subject}</div>
                                    <div className="text-xs truncate">{event.class}</div>
                                    <div className="text-xs truncate">{event.time}</div>
                                    <div className="text-xs truncate">{event.teacher}</div>
                                  </div>

                                  {/* Thông tin bổ sung */}
                                  <div className="mt-1 space-y-1">
                                    {(isNormalExam || isPostponedExam || isMakeupExam) && event.exam_date && (
                                      <div className="text-xs opacity-80 truncate">
                                        Ngày thi: {event.exam_date}
                                      </div>
                                    )}
                                    {(isPostponedLesson || isPostponedExam) && event.makeup_date && (
                                      <div className="text-xs opacity-80 truncate">
                                        Bù: {event.makeup_date}
                                      </div>
                                    )}
                                    {(isMakeupLesson || isMakeupExam) && event.original_date && (
                                      <div className="text-xs opacity-80 truncate">
                                        Bù của ngày: {event.original_date}
                                      </div>
                                    )}
                                    {event.description && (
                                      <div className="text-xs opacity-80 truncate">
                                        Ghi chú: {event.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm h-full flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200">
                            Không có lịch
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <SideBarMobile />
    </div>
  );
};

export default Schedule;
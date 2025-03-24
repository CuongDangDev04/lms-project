import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCoursesByInstructor } from "../../services/instructorServices";
import { format, isThisMonth, subMonths, isWithinInterval } from "date-fns";

// Các hình ảnh mặc định (tương tự Course)
import imgDefault from "../../assets/img_courses/img1.jpg";
import img1 from "../../assets/img_courses/img1.jpg";
import img2 from "../../assets/img_courses/img2.jpg";
import img3 from "../../assets/img_courses/img3.jpg";
import img4 from "../../assets/img_courses/img4.jpg";
import img5 from "../../assets/img_courses/img5.jpg";
import img6 from "../../assets/img_courses/img6.jpg";

// Bảng ánh xạ tên ảnh với file import
const imageMap = {
  img1: img1,
  img2: img2,
  img3: img3,
  img4: img4,
  img5: img5,
  img6: img6,
};

export const Subject = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entitiesPerPage = 6;

  const navigate = useNavigate();

  // Lấy teacherId từ localStorage
  const getTeacherIdFromLocalStorage = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id;
  };

  const teacherId = getTeacherIdFromLocalStorage();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!teacherId) {
        setError("Không tìm thấy thông tin giảng viên trong localStorage");
        setLoading(false);
        return;
      }

      try {
        const data = await getCoursesByInstructor(teacherId);
        setCourses(data.data); // Dữ liệu từ API đã có định dạng phù hợp
        setLoading(false);
      } catch (err) {
        setError("Không thể tải danh sách khóa học");
        setLoading(false);
      }
    };

    fetchCourses();
  }, [teacherId]);

  // Hàm định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  // Hàm xác định trạng thái khóa học
  const getCourseStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start) return "Chưa bắt đầu";
    if (now > end) return "Đã hoàn thành";
    return "Đang diễn ra";
  };

  // Lọc khóa học dựa trên tìm kiếm, trạng thái và ngày
  const filteredCourses = courses.filter((course) => {
    const courseName = course.course_name || "";
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);
    const status = getCourseStatus(course.start_date, course.end_date);

    const matchesSearch = courseName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    let matchesDate = true;
    if (dateFilter === "thisMonth") {
      matchesDate = isThisMonth(startDate);
    } else if (dateFilter === "lastMonth") {
      const lastMonth = subMonths(new Date(), 1);
      matchesDate = isWithinInterval(startDate, {
        start: lastMonth,
        end: new Date(),
      });
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Xử lý khi nhấp vào khóa học
  const handleCourseClick = (classroom_id) => {
    if (classroom_id) {
      navigate(`/courseDetail/${classroom_id}`);
    } else {
      console.error("Không tìm thấy classroom_id cho khóa học này");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * entitiesPerPage,
    currentPage * entitiesPerPage
  );
  const totalPages = Math.ceil(filteredCourses.length / entitiesPerPage);

  const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center items-center mt-8 space-x-3">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gradient-to-r rounded-full shadow-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 duration-300 from-gray-200 hover:from-gray-300 hover:to-gray-200 px-5 py-2 to-gray-100 transition-all"
      >
        Trước
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-5 py-2 rounded-full transition-all duration-300 shadow-sm ${
            currentPage === page
              ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white"
              : "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 hover:from-gray-300 hover:to-gray-200"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-gradient-to-r rounded-full shadow-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 duration-300 from-gray-200 hover:from-gray-300 hover:to-gray-200 px-5 py-2 to-gray-100 transition-all"
      >
        Sau
      </button>
    </div>
  );

  return (
    <div className="mt-28 px-4 pb-20 lg:px-8 bg-gray-50 min-h-screen font-sans">
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="mt-10 container mx-auto">
        <div className="flex flex-col gap-6">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm"
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-3 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đã hoàn thành">Đã hoàn thành</option>
                <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                <option value="Đang diễn ra">Đang diễn ra</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-3 bg-white border border-gray-200 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">Tất cả ngày</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách khóa học */}
      <div className="mt-12 container mx-auto">
        {filteredCourses.length === 0 ? (
          <p className="text-center text-gray-500 text-lg font-medium py-12 bg-white rounded-lg shadow-sm">
            Không tìm thấy khóa học nào. Hãy thử lại!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course, index) => {
              const courseImage =
                imageMap[`img${(index % 6) + 1}`] || imgDefault; // Gán ảnh tuần tự
              const startCourse = formatDate(course.start_date);
              const endCourse = formatDate(course.end_date);

              return (
                <div
                  key={`${course.course_id}-${course.classroom_id}-${index}`}
                  onClick={() => handleCourseClick(course.classroom_id)}
                  className="group bg-white mb-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={courseImage}
                      alt={`${course.course_name} thumbnail`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {course.course_name} - {course.class_name}
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-3 flex items-center text-gray-500 text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {startCourse} - {endCourse}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Subject;

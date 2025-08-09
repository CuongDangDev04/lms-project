import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchStudentCourses } from "../../services/courseServices";
import { format, isThisMonth, subMonths, isWithinInterval } from "date-fns";
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

export default function Course() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entitiesPerPage = 6;

  useEffect(() => {
    document.title = "Khóa học của tôi - BrainHub";
    const fetchCourses = async () => {
      const course = await fetchStudentCourses();
      setCourses(course);
    };
    fetchCourses();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const filteredCourses = courses.filter((course) => {
    let Course = course.Classroom.Course;
    let courseName = Course.course_name || "";
    let startDate = new Date(course.Classroom.start_date);
    let status = course.Classroom.status || "Chưa bắt đầu";

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
          className={`px-5 py-2 rounded-full transition-all duration-300 shadow-sm ${currentPage === page
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
    <div className="mt-28 mb-10 px-4 pb-10 bg-gray-50  lg:px-8 min-h-screen font-sans">
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="mt-10 container mx-auto">
        <div className="flex flex-col gap-6">
          {/* Thanh tìm kiếm */}
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400 text-sm"
          />
          {/* Bộ lọc */}
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
              let Classroom = course.Classroom;
              let Class = Classroom.Class;
              let className = Class.class_name;
              let classroom_id = Classroom.classroom_id;
              let Course = Classroom.Course;
              let courseName = Course.course_name || "Khóa học chưa đặt tên";
              let courseDescription = Course.description || "Không có mô tả";
              let courseImage = imageMap[Course.course_img] || imgDefault;
              let courseId = Course.course_id;
              let courseStart = Classroom.start_date;
              let courseEnd = Classroom.end_date;
              const startCourse = formatDate(courseStart);
              const endCourse = formatDate(courseEnd);

              return (
                <Link
                  to={`/courseDetail/${classroom_id}`}
                  key={`${courseId}-${index}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={courseImage}
                      alt={`${courseName} thumbnail`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {courseName} - {className}
                    </h3>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {courseDescription}
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
                </Link>
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
}

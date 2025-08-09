import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ClipboardList, MessageSquare, Presentation, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchTeacherInformation, getCourseById } from "../../services/courseServices";

const SidebarCourseDetail_left = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { classroomId } = useParams();
  const [activePath, setActivePath] = useState("");
  const [teacherData, setTeacherData] = useState(null);
  const [courseName, setCourseName] = useState("Không xác định");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role_id || null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const sidebarItems = [
    { name: "Tin Nhắn", path: "messages", icon: MessageSquare },
    { name: "Thành viên", path: "members", icon: Users },
    { name: "Bài tập", path: "assignments", icon: ClipboardList },
    { name: "Bài giảng", path: "lectures", icon: Presentation },
    {
      name: "Bài thi",
      path: userRole === 2 ? "create-exam" : "list-exam",
      icon: ClipboardList,
    },
  ];

  if (userRole === 2) {
    sidebarItems.push({
      name: "Quản lý điểm",
      path: "grades",
      icon: ClipboardList,
    });
  }

  useEffect(() => {
    const getTeacherInfoAndCourse = async () => {
      if (!classroomId) return;
      try {
        setLoading(true);
        const teacherInfo = await fetchTeacherInformation(classroomId);
        setTeacherData(teacherInfo);

        const courseId = teacherInfo?.course_id;
        if (courseId) {
          const courseData = await getCourseById(courseId);
          setCourseName(courseData?.course_name || "Không xác định");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải thông tin");
      } finally {
        setLoading(false);
      }
    };
    getTeacherInfoAndCourse();
  }, [classroomId]);

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const lastSegment = pathSegments.pop();
    const secondLastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment === "exam-results" || secondLastSegment === "exam-results") {
      setActivePath(userRole === 2 ? "create-exam" : "list-exam");
    } else {
      const pathValid =
        sidebarItems.find((item) => item.path === lastSegment)?.path || "messages";
      setActivePath(pathValid);
    }
  }, [location.pathname, userRole, sidebarItems]);

  // Chỉ chạy khi component mount để thiết lập trạng thái ban đầu
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      // Chỉ đặt trạng thái ban đầu, không ghi đè liên tục
      setIsSidebarOpen((prev) => (prev === null ? !isSmallScreen : prev));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  const teachers = teacherData?.Users || [];
  const teacherName = teachers.length > 0 ? teachers[0].fullname : "Không xác định";
  const className = teacherData?.Class?.class_name || "Không xác định";

  return (
    <>
      {/* Nút toggle cho mobile (giả sử nằm ngoài sidebar) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        {isSidebarOpen ? "Đóng" : "Mở"}
      </button>

      <motion.div
        className={`h-[calc(100vh-4rem)] mt-4 bg-white shadow-xl flex flex-col overflow-y-auto ${
          isSidebarOpen ? "fixed inset-0 z-50 md:static md:max-w-xs" : "hidden md:block"
        }`}
        style={{
          width: "16rem",
          paddingTop: window.innerWidth < 768 ? "3rem" : "0",
        }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-3 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0"
          >
            <h2 className="text-base md:text-lg font-semibold truncate">
              {loading ? "Đang tải..." : courseName}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 truncate">
              Giảng viên: {teacherName}
            </p>
            <p className="text-xs md:text-sm text-gray-600 truncate">
              Mã lớp: {className}
            </p>
          </motion.div>
        </div>

        <motion.ul
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 p-2 md:p-3 space-y-1 md:space-y-2"
        >
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.path === activePath;
            return (
              <Link key={item.path} to={item.path} className="block">
                <motion.li
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center rounded-xl cursor-pointer transition-colors duration-200 w-full
                    ${isActive
                      ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                    p-2 md:p-3`}
                >
                  <IconComponent className="h-5 w-5 min-w-[20px]" />
                  <motion.span className="ml-2 md:ml-3 text-sm md:text-base truncate">
                    {item.name}
                  </motion.span>
                  {isActive && (
                    <motion.div
                      className="ml-auto h-2 w-2 rounded-full bg-white"
                      layoutId="activeIndicator"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.li>
              </Link>
            );
          })}
        </motion.ul>
        <div className="p-2 md:p-3 pb-8 mb-10 border-t border-gray-100">
          <Link
            to={`/classroom/${classroomId}`}
            className="flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold 
                 w-full py-2 md:py-3 rounded-md hover:bg-blue-700 transition 
                 text-sm md:text-base"
          >
            Vào lớp
          </Link>
        </div>
      </motion.div>
    </>
  );
};

export default SidebarCourseDetail_left;
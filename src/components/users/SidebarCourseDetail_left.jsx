import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ClipboardList,
  MessageSquare,
  Presentation,
  Users,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchTeacherInformation, getCourseById } from "../../services/courseServices";

const SidebarCourseDetail_left = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { classroomId } = useParams();
  const [activePath, setActivePath] = useState("messages");
  const [teacherData, setTeacherData] = useState(null);
  const [courseName, setCourseName] = useState("Không xác định"); // State để lưu tên khóa học
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

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

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "5rem" },
  };

  const sidebarItems = [
    { name: "Tin Nhắn", path: "messages", icon: MessageSquare },
    { name: "Thành viên", path: "members", icon: Users },
    { name: "Bài tập", path: "assignments", icon: ClipboardList },
    { name: "Bài giảng", path: "lectures", icon: Presentation },
  ];

  useEffect(() => {
    const getTeacherInfoAndCourse = async () => {
      if (!classroomId) return;
      try {
        setLoading(true);
        // Lấy thông tin teacher
        const teacherInfo = await fetchTeacherInformation(classroomId);
        setTeacherData(teacherInfo);

        // Lấy course_id từ teacherData và gọi API để lấy tên khóa học
        const courseId = teacherInfo?.course_id; // Giả sử course_id nằm trực tiếp trong teacherInfo
        if (courseId) {
          const courseData = await getCourseById(courseId);
          setCourseName(courseData?.course_name || "Không xác định"); // Giả sử API trả về course_name
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
    const path = location.pathname.split("/").pop();
    const pathValid =
      sidebarItems.find((item) => item.path === path)?.path || "messages";
    setActivePath(pathValid);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, setIsSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 768;
      setIsCollapsed(shouldCollapse);
      setIsSidebarOpen(!shouldCollapse);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsCollapsed, setIsSidebarOpen]);

  const teachers = teacherData?.Users || [];
  const teacherName = teachers.length > 0 ? teachers[0].username : "Không xác định";
  const className = teacherData?.Class?.class_name || "Không xác định";

  console.log("teacherData", teacherData);
  console.log("courseName", courseName);

  return (
    <motion.div
      className="h-[calc(100vh-4rem)] mt-2 bg-white shadow-xl flex flex-col overflow-y-auto md:max-w-xs sm:pt-12"
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ paddingTop: window.innerWidth < 768 ? "3rem" : "0" }}
    >
      <div
        className={`flex items-center justify-between border-b border-gray-100 ${
          isCollapsed ? "p-2" : "p-3 md:p-4"
        }`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          {isCollapsed ? (
            <h2 className="text-sm font-semibold truncate">
              {loading ? "Đang tải..." : courseName}
            </h2>
          ) : (
            <>
              <h2 className="text-base md:text-lg font-semibold truncate">
                {loading ? "Đang tải..." : courseName}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                Giảng viên: {teacherName}
              </p>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                Mã lớp: {className}
              </p>
            </>
          )}
        </motion.div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none ${
            isCollapsed ? "w-10 h-10 flex justify-center items-center" : ""
          }`}
          aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 md:h-5 md:w-5 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`flex-1 ${isCollapsed ? "p-1" : "p-2 md:p-3"} ${
          isCollapsed ? "space-y-1" : "space-y-1 md:space-y-2"
        }`}
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
                  ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                  ${isCollapsed ? "justify-center p-2" : "p-2 md:p-3"}`}
              >
                <IconComponent className="h-5 w-5 min-w-[20px]" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 md:ml-3 text-sm md:text-base truncate"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
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
      <div className="p-2 md:p-3 border-t border-gray-100">
        <Link
          to={`/classroom/${classroomId}`}
          className="flex items-center justify-center bg-blue-600 text-white font-semibold 
               w-full py-2 md:py-3 rounded-md hover:bg-blue-700 transition 
               text-sm md:text-base"
        >
          Vào lớp
        </Link>
      </div>
    </motion.div>
  );
};

export default SidebarCourseDetail_left;
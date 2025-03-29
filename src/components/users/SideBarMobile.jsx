import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, User, Bell, LogOut } from "lucide-react"; // Thêm Bell và LogOut
import { logout } from "../../services/authServices"; // Thêm logout
import { toast } from "react-toastify"; // Thêm toast
import "react-toastify/dist/ReactToastify.css"; // CSS cho toast

const SideBarMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Trạng thái dropdown
  const navigate = useNavigate();
  const location = useLocation();
  const isClassroom = location.pathname.includes("/classroom");
  // Get role_id from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const roleId = user.role_id || 1; // Mặc định role_id là 1 nếu không có

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Base menu items (cho sinh viên)
  const baseMenuItems = [
    { name: "Trang chủ", icon: <Home size={24} />, path: "/" },
    { name: "Khóa học", icon: <BookOpen size={24} />, path: "/courses" },
    { name: "Lịch học", icon: <Calendar size={24} />, path: "/schedule" },
    { name: "Hồ sơ", icon: <User size={24} />, path: "/profile" },
  ];

  // Teacher menu items (cho giảng viên)
  const teacherMenuItems = [
    { name: "Trang chủ", icon: <Home size={24} />, path: "/" },
    { name: "Môn giảng dạy", icon: <BookOpen size={24} />, path: "/subjects" },
    {
      name: "Lịch dạy",
      icon: <Calendar size={24} />,
      path: "/teaching-schedule",
    },
    { name: "Hồ sơ", icon: <User size={24} />, path: "/profile" },
  ];

  // Select menu items based on role_id
  const menuItemsMobile = roleId === 2 ? teacherMenuItems : baseMenuItems;

  // Determine active item based on pathname
  const getActiveItem = () => {
    const currentPath = location.pathname;
    return (
      menuItemsMobile.find((item) => item.path === currentPath)?.path || "/"
    );
  };

  return isMobile && !isClassroom ? (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t flex justify-around py-2 z-50">
      {menuItemsMobile.map((item) => (
        <button
          key={item.name}
          className={`flex flex-col items-center p-2 ${
            getActiveItem() === item.path
              ? "text-red-600 font-semibold"
              : "text-gray-600"
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span className="text-xs">{item.name}</span>
        </button>
      ))}
    </div>
  ) : null;
};

export default SideBarMobile;

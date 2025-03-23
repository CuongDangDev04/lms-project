import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../services/authServices";
import { getProfile } from "../../services/userServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import Notifications from "./Notification";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: "User", avatar: null, role_id: null });
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        const fullName = profileData.fullname || "User";
        const nameParts = fullName.split(" ");
        const lastTwoWords = nameParts.slice(-2).join(" ");
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const roleId = user.role_id || profileData.role_id || 1;
        setUserProfile({
          name: lastTwoWords,
          avatar: profileData.avt || null,
          role_id: parseInt(roleId),
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const roleId = user.role_id || 1;
        setUserProfile((prev) => ({
          ...prev,
          role_id: parseInt(roleId),
        }));
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Đăng xuất thất bại!");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleNotifications = () => setIsNotificationsOpen((prev) => !prev);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavigationItems = () => {
    if (userProfile.role_id === 2) {
      return [
        { to: "/", label: "Tổng quan" },
        { to: "/subjects", label: "Môn giảng dạy" },
        { to: "/teaching-schedule", label: "Lịch dạy" },
      ];
    }
    return [
      { to: "/", label: "Tổng quan" },
      { to: "/courses", label: "Khóa học" },
      { to: "/schedule", label: "Lịch học" },
      { to: "/assign-course", label: "Đăng ký học phần" },
    ];
  };

  const navItems = getNavigationItems();

  return (
    <>
      <ToastContainer />
      <nav
        className={`fixed top-0 left-0 w-full  bg-white shadow-md z-50 transition-all duration-300 ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        <div className="relative flex items-center px-4 sm:px-6 py-4 lg:px-14 lg:py-6">
          {/* Logo ở giữa cho mobile, trái cho desktop */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none">
            <img
              src="/logo.png"
              alt="logo"
              className="h-6 sm:h-8 lg:h-6 object-cover scale-125 lg:scale-150"
            />
          </Link>

          {/* Menu cho desktop */}
          <div className="hidden lg:flex flex-1 justify-center space-x-6 text-gray-700">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 transition-all ${
                  location.pathname === item.to
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Thông báo và Profile */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Thông báo luôn hiển thị */}
            <div className="relative" ref={notificationsRef}>
              <div
                className="p-2 hover:bg-gray-100 rounded-full relative cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleNotifications();
                }}
              >
                <Bell
                  className={`text-gray-600 ${
                    window.innerWidth < 1024 ? "w-4 h-4 sm:w-5 sm:h-5" : "w-6 h-6"
                  }`}
                />
                {notificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              {isNotificationsOpen && (
                <div
                  className="absolute right-0 mt-2 rounded-lg p-4 bg-white shadow-lg z-50"
                  onMouseEnter={() => setIsNotificationsOpen(true)}
                  onMouseLeave={() => setIsNotificationsOpen(false)}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Notifications setNotificationsCount={setNotificationsCount} />
                </div>
              )}
            </div>

            {/* Profile chỉ hiển thị trên desktop */}
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <div
                className="flex items-center space-x-1 cursor-pointer bg-gray-200 rounded-full pr-2"
                onClick={toggleDropdown}
              >
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-700 font-medium">{userProfile.name}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                  <Link
                    to="/profile"
                    className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Hồ sơ</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
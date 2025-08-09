import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, uploadImage } from "../../services/userServices";
import { logout } from "../../services/authServices";
import "react-toastify/dist/ReactToastify.css";
import useUserId from "../../hooks/useUserId";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage
  const userId = useUserId();

  useEffect(() => {
    document.title = "Thông tin cá nhân - BrainHub";
    if (!userId) return;
    const fetchUser = async () => {
      try {

        const response = await getUserById(userId);
        setUser(response);
        console.log(response);
      } catch (error) {
        setError(error.message || "Lỗi không xác định");
      }
    };
    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await logout(); // Gọi hàm logout từ authServices
      localStorage.removeItem("user"); // Xóa thông tin user khỏi localStorage
      navigate("/login"); // Chuyển hướng về trang đăng nhập sau khi đăng xuất
    } catch (error) {
      setError(error.message || "Đăng xuất thất bại"); // Hiển thị lỗi nếu có
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        setError(null);
        const updatedUser = await uploadImage(file);
        setUser(updatedUser.data);
        // Cập nhật lại localStorage với thông tin user mới (bao gồm avatar mới)
        localStorage.setItem("user", JSON.stringify(updatedUser.data));
      } catch (error) {
        setError(error.message || "Upload ảnh avatar thất bại");
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen pb-10 w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 flex flex-col">
      <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/path-to-logo.png" alt="Logo" className="h-8" />
          <div className="flex gap-4">
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm"
            >
              Tổng quan
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm"
            >
              Khóa học
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm"
            >
              Lịch học
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={user?.avt || "/default-avatar.png"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-gray-700 font-medium text-sm">
            {user?.username || "admin"}
          </span>
        </div>
      </nav>

      <div className="flex-1 flex flex-col p-4 gap-6 w-[80%] max-w-4xl mx-auto">
        <div className="w-full flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg">
          <div className="relative mb-4 group">
            {user?.avt ? (
              <img
                src={user.avt}
                alt="Avatar"
                className="w-48 h-48 rounded-full object-cover border-3 border-indigo-100 shadow-md"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-5xl font-bold border-3 border-indigo-100 shadow-md">
                {user?.fullname?.charAt(0).toUpperCase()}
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-3 right-3 bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 shadow-md disabled:bg-indigo-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? (
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              name="avatar"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {user?.fullname || "Chưa có tên"}
          </h2>
        </div>

        <div className="w-full bg-white p-6 rounded-2xl shadow-lg">
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm text-sm">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {!user ? (
            <div className="flex justify-center items-center min-h-[150px]">
              <div className="flex items-center gap-3">
                <div className="rounded-full h-10 w-10 border-t-3 border-indigo-500 border-opacity-75 animate-spin"></div>
                <span className="text-lg text-gray-600 font-medium">
                  Đang tải...
                </span>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-semibold text-indigo-600 mb-6 pb-2 border-b-2 border-indigo-100">
                Thông tin cá nhân
              </h3>
              <div className="space-y-6 text-gray-700 text-base">
                {/* Hiển thị thông tin dựa trên role_id */}
                {user.role_id === 1 ? (
                  // Thông tin cho sinh viên (role_id = 1)
                  <>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Họ tên:</span>
                      <span className="text-gray-800 font-medium">
                        {user.fullname || "Chưa có họ tên"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">
                        Mã số sinh viên:
                      </span>
                      <span className="text-gray-800 font-medium">
                        {user.username || "Chưa có mã số sinh viên"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-800 font-medium">
                        {user.email || "Chưa có email"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Giới tính:</span>
                      <span className="text-gray-800 font-medium">
                        {user.gender === true
                          ? "Nam"
                          : user.gender === false
                            ? "Nữ"
                            : "Chưa xác định"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Ngày sinh:</span>
                      <span className="text-gray-800 font-medium">
                        {user.birth
                          ? new Date(user.birth).toLocaleDateString("vi-VN")
                          : "Chưa có ngày sinh"}
                      </span>
                    </div>
                  </>
                ) : user.role_id === 2 ? (
                  // Thông tin cho giảng viên (role_id = 2)
                  <>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Họ tên:</span>
                      <span className="text-gray-800 font-medium">
                        {user.fullname || "Chưa có họ tên"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">
                        Mã giảng viên:
                      </span>
                      <span className="text-gray-800 font-medium">
                        {user.username || "Chưa có mã giảng viên"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-800 font-medium">
                        {user.email || "Chưa có email"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Giới tính:</span>
                      <span className="text-gray-800 font-medium">
                        {user.gender === true
                          ? "Nam"
                          : user.gender === false
                            ? "Nữ"
                            : "Chưa xác định"}
                      </span>
                    </div>
                    <div className="flex flex-col p-2 rounded-lg transition-colors duration-200">
                      <span className="font-medium text-gray-600">Ngày sinh:</span>
                      <span className="text-gray-800 font-medium">
                        {user.birth
                          ? new Date(user.birth).toLocaleDateString("vi-VN")
                          : "Chưa có ngày sinh"}
                      </span>
                    </div>

                  </>
                ) : (
                  // Trường hợp role_id không xác định
                  <div className="text-center text-gray-600">
                    Vai trò người dùng không xác định.
                  </div>
                )}
              </div>
            </>
          )}
          {/* Nút đăng xuất luôn hiển thị */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
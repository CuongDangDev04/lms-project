import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL; // API URL từ .env
const REFRESH_TOKEN = import.meta.env.VITE_API_REFRESH_TOKEN;

// Tạo một instance của Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm Access Token vào mỗi request
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    // Giải mã token để lấy role_id
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      config.headers["X-User-Role"] = payload.role_id; 
    } catch (error) {
      console.error("Lỗi khi giải mã token:", error);
    }
  }
  return config;
});


// Xử lý khi Access Token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("Không tìm thấy refresh token, vui lòng đăng nhập lại.");
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        const res = await axios.post(REFRESH_TOKEN, { refreshToken });

        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        // Gán lại Access Token cho request cũ và gửi lại
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Làm mới token thất bại, vui lòng đăng nhập lại.");
        window.location.href = "/login"; // Chuyển hướng về trang login

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

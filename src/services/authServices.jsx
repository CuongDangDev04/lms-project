import axios from 'axios';
import  api from './api';

const API_LOGIN = import.meta.env.VITE_API_LOGIN;
const API_REFRESH_TOKEN = import.meta.env.VITE_API_REFRESH_TOKEN;
const API_FORGOT_PASSWORD = import.meta.env.VITE_API_FORGOT_PASSWORD;
const API_RESET_PASSWORD = import.meta.env.VITE_API_RESET_PASSWORD;
export const login = async (username, password) => {
  try {
    const response = await axios.post(API_LOGIN, { username, password });

    localStorage.setItem("accessToken", response.data.loginToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
}
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Không tìm thấy refresh token, vui lòng đăng nhập lại!");

    const response = await axios.post(API_REFRESH_TOKEN, { refreshToken });
    if (!response.data.accessToken) {
      throw new Error("Không nhận được access token mới!");
    }

    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Refresh token hết hạn, yêu cầu đăng nhập lại.");
      logout();
    } else {
      console.error("Lỗi khi làm mới access token:", error.response?.data || error.message);
    }
    throw error;
  }
};
// Hàm gọi API gửi mã xác nhận
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(API_FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Hàm gọi API đặt lại mật khẩu
export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await axios.post(API_RESET_PASSWORD, { email, code, newPassword });
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
export const deactivateAccount = async (userId, userStatus) => {  
  try {
    const response = await api.post("/api/auth/deactivate", { user_id: userId, user_status: userStatus });
    return response.data;
  } catch (error) {
    console.error("Deactivate account error:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
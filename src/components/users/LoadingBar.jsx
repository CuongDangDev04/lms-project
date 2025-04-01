import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useLocation } from "react-router-dom";

// Nhận prop `isLoading` từ bên ngoài
const LoadingBar = ({ isLoading = false }) => {
  const [loading, setLoading] = useState(isLoading); // Khởi tạo dựa trên prop
  const location = useLocation();

  useEffect(() => {
    // Cập nhật trạng thái loading khi prop isLoading thay đổi
    setLoading(isLoading);

    if (isLoading) {
      NProgress.configure({ showSpinner: false });
      NProgress.start();
    } else {
      setTimeout(() => {
        NProgress.done();
      }, 300); // Giữ độ trễ 300ms để mượt mà
    }

    return () => {
      if (isLoading) NProgress.done(); // Cleanup nếu đang loading
    };
  }, [isLoading]); // Phụ thuộc vào isLoading

  useEffect(() => {
    // Logic cũ: chạy khi location thay đổi
    NProgress.configure({ showSpinner: false });
    NProgress.start();
    setLoading(true);

    setTimeout(() => {
      NProgress.done();
      setLoading(false);
    }, 300);

    return () => {
      NProgress.done();
    };
  }, [location]); // Phụ thuộc vào location

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center   backdrop-blur-sm z-50">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Vòng tròn xoay lớn */}
        <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        {/* Logo chính giữa */}
        <img src="/loading.png" alt="Loading..." className="w-16 h-16" />
      </div>
    </div>
  );
};

export default LoadingBar;
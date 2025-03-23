import { Navigate, Outlet } from "react-router-dom";

// Hàm kiểm tra trạng thái đăng nhập và lấy role_id
const getUserRoleId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.role_id : null; 
};

const PrivateRoute = ({ allowedRoles }) => {
  const accessToken = localStorage.getItem("accessToken");
  const userRoleId = getUserRoleId();
  //méo có accessToken thì login lai
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Nếu role_id không nằm trong danh sách allowedRoles, chuyển hướng về trang login
  if (!allowedRoles.includes(userRoleId)) {
    return <Navigate to="/login" replace />;
  }

  // Nếu hợp lệ, render nội dung route con
  return <Outlet />;
};

export default PrivateRoute;
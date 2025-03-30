import { Navigate, Outlet, useLocation } from "react-router-dom";

const getUserRoleId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? user.role_id : null;
};

const PrivateRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const accessToken = localStorage.getItem("accessToken");
  const userRoleId = getUserRoleId();

  // Nếu không có accessToken thì yêu cầu đăng nhập lại
  if (!accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  // Nếu role_id không có trong danh sách được phép, chuyển hướng về trang login
  if (!allowedRoles.includes(userRoleId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

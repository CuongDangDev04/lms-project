// Thư viện bên ngoài
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

// Hooks/tiện ích nội bộ
import { connectSocket, socket } from "../hooks/useSocket";

// Components nội bộ
import LoadingBar from "../components/users/LoadingBar";
import Navbar from "../components/users/Navbar";

// Khai báo biến toàn cục
const BASE_URL = import.meta.env.VITE_API_BASE_URL; 


import SideBarMobile from "../components/users/SideBarMobile";
import NotificationService from "../services/notificationService";
const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInMessagePage = /^\/courseDetail\/\d+(\/messages)?$/.test(
    location.pathname
  );
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?.id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    connectSocket();
    socket.emit("registerUser", userId);
    console.log("🔗 Đã đăng ký userId:", userId);

    socket.on("disconnect", () => {
      console.warn("⚠️ Socket bị mất kết nối. Đang thử kết nối lại...");
    });

    socket.on("connect", () => {
      console.log("✅ Đã kết nối lại Socket!");
      socket.emit("registerUser", userId);
    });

    return () => {
      socket.off("disconnect");
      socket.off("connect");
    };
  }, [userId]);
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId, userId);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc thông báo:", error);
    }
  };
  useEffect(() => {
    socket
      .off("tagNotification")
      .on("tagNotification", ({ sender, sendTo, classroomId }) => {
        console.log("🏷️ Tag notification:", sender, sendTo, classroomId);
        if (!isInMessagePage && sender !== userId && sendTo == userId) {
          toast.info(`Bạn được tag trong lớp học!`, {
            position: "top-right",
            autoClose: 20000,
            className: "cursor-pointer",
            onClick: () => {
              navigate(`/courseDetail/${classroomId}/messages`);
              toast.dismiss();
            },
          });
        }
      });

    socket
      .off("toastNotification")
      .on(
        "toastNotification",
        ({ notificationId, message, notificationType }) => {
          let toastOptions = {
            position: "top-right",
            autoClose: 5000,
          };
          console.log(
            "Toast notification:",
            notificationId,
            notificationType,
            message
          );

          switch (notificationType) {
            case "tag":
              markAsRead(notificationId);
              break;
            case "classroom":
              toast(`${message}`, {
                ...toastOptions,
                className: "classroom-toast",
              });
              break;
            case "system":
              toast(` ${message}`, {
                ...toastOptions,
                className: "system-toast",
              });
              break;
            default:
              toast(message, toastOptions);
          }
        }
      );

    return () => {
      socket.off("tagNotification");
      socket.off("toastNotification");
    };
  }, [isInMessagePage, userId, navigate, location.pathname]);

  return (
    <>
      <ToastContainer />
      <LoadingBar />
      <Navbar />
      <Outlet />
      <SideBarMobile />
    </>
  );
};

export default UserLayout;

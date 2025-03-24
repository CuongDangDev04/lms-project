import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
// import { io } from "socket.io-client";
import LoadingBar from "../components/users/LoadingBar";
import Navbar from "../components/users/Navbar";
import NotificationService from "../services/notificationService";

import { connectSocket, socket } from "../hooks/useSocket";

import SideBarMobile from "../components/users/SideBarMobile";
import useUserId from "../hooks/useUserId";
const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInMessagePage = /^\/courseDetail\/\d+(\/messages)?$/.test(
    location.pathname
  );
  const userId = useUserId();

  useEffect(() => {
    if (!userId) return;
    connectSocket();
    socket.emit("registerUser", userId);

    socket.on("disconnect", () => {
      console.warn("⚠️ Socket bị mất kết nối. Đang thử kết nối lại...");
    });

    socket.on("connect", () => {
      socket.emit("registerUser", userId);
    });

    return () => {
      socket.off("disconnect");
      socket.off("connect");
    };
  }, [userId]);

  useEffect(() => {
    socket
      .off("tagNotification")
      .on("tagNotification", ({ sender, sendTo, classroomId }) => {
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
      .off("receiveMessageNotification")
      .on(
        "receiveMessageNotification",
        ({ sender, sendTo, classroomId, courseName }) => {
          if (!isInMessagePage && sender !== userId && sendTo == userId) {
            toast.info(`Lớp ${courseName} của bạn có tin nhắn mới!`, {
              position: "top-right",
              autoClose: 20000,
              className: "cursor-pointer",
              onClick: () => {
                navigate(`/courseDetail/${classroomId}/messages`);
                toast.dismiss();
              },
            });
          }
        }
      );
    const markAsRead = async (notificationId) => {
      try {
        await NotificationService.markAsRead(notificationId, userId);
      } catch (error) {
        console.error("Lỗi khi đánh dấu đã đọc thông báo:", error);
      }
    };
    socket
      .off("toastNotification")
      .on(
        "toastNotification",
        ({ notificationId, message, notificationType }) => {
          let toastOptions = {
            position: "top-right",
            autoClose: 5000,
          };

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
      socket.off("receiveMessageNotification");
    };
  }, [isInMessagePage, userId, navigate, location.pathname]);

  return (
    <>
      <LoadingBar />
      <Navbar />
      <Outlet />
      <SideBarMobile />
    </>
  );
};

export default UserLayout;

import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";

import { toast, ToastContainer } from "react-toastify"; // Thêm toast
import "react-toastify/dist/ReactToastify.css"; // Thêm CSS cho toast
import NotificationService from "'../../services/notificationService'";
import { Bell, Tag, Users, Settings } from "lucide-react";
import { connectSocket, socket } from "../../hooks/useSocket";
import { fetchStudentCourses } from "../../services/courseServices";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;
    setUserId(user.id);
    connectSocket();
    socket.emit("registerUser", user.id);

    fetchNotifications(user);

    socket.on("receiveNotification", handleNotification);
    socket.on("notificationDeleted", handleDeleteNotification);

    // Lắng nghe toast notification từ socket
    socket.on("toastNotification", handleToastNotification);

    return () => {
      socket.off("receiveNotification", handleNotification);
      socket.off("notificationDeleted", handleDeleteNotification);
      socket.off("toastNotification", handleToastNotification);
    };
  }, []);

  const fetchNotifications = async (user) => {
    try {
      const response = await NotificationService.getNotifications(user);
      const sortedNotifications = response.data.sort((a, b) => {
        const statusA = a.status;
        const statusB = b.status;
        const timeA = new Date(a.Notification.timestamp);
        const timeB = new Date(b.Notification.timestamp);

        if (statusA !== statusB) {
          return statusA === false ? -1 : 1;
        }

        return timeB - timeA;
      });
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  const handleNotification = (notification) => {
    setNotifications((prev) => [
      {
        notification_id: notification.notification_id,
        notification_type: notification.notification_type,
        is_read: notification.status,
        Notification: {
          message: notification.message,
          timestamp: notification.timestamp,
        },
      },
      ...prev,
    ]);
  };

  // Hàm xử lý toast notification từ socket
  const handleToastNotification = ({ notificationType, message }) => {
    console.log("Toast notification:", notificationType, message);
    toast.info(message, {
      position: "top-right",
      autoClose: 5000, // Tự đóng sau 5 giây
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId, userId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
      socket.emit("notificationRead", notificationId);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };
  const markAllAsRead = async () => {
    try {
      const response = await NotificationService.markAllAsRead(userId);
      console.log("markAllAsRead response:", response.data);

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );

      socket.emit("allNotificationsRead");
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId, userId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.notification_id !== notificationId)
      );
      socket.emit("deleteNotification", notificationId);
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error);
    }
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.notification_id !== notificationId)
    );
  };

  const deleteAllNotifications = async () => {
    try {
      await NotificationService.deleteAllNotifications(userId);
      setNotifications([]);
      socket.emit("deleteAllNotifications");
    } catch (error) {
      console.error("Lỗi khi xóa tất cả thông báo:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "tag":
        return <Tag className="text-blue-500 w-5 h-5" />;
      case "classroom":
        return <Users className="text-yellow-500 w-5 h-5" />;
      case "system":
        return <Settings className="text-green-500 w-5 h-5" />;
      default:
        return <Bell className="text-gray-500 w-5 h-5" />;
    }
  };
  const tagNavigate = async (message) => {
    try {
      if (!message) {
        console.error("Message is undefined, cannot navigate.");
        return;
      }
      let courseName = message.replace("Bạn đang được tag trong lớp ", "");
      let courses = await fetchStudentCourses();
      let course = courses.find(
        (c) => c.Classroom.Course.course_name === courseName
      );
      if (course) {
        navigate(`/courseDetail/${course.classroom_id}/messages`);
      } else {
        console.error(`Không tìm thấy khóa học với tên: ${courseName}`);
      }
    } catch (error) {
      console.error("Lỗi khi chuyển hướng:", error);
    }
  };
  return (
    <div className="w-96 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Bell className="text-indigo-500 w-6 h-6" /> Thông báo
        </h2>
        {notifications.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="text-blue-500 text-sm hover:underline"
            >
              Đọc tất cả
            </button>
            <button
              onClick={deleteAllNotifications}
              className="text-red-500 text-sm hover:underline"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>
      <ul className="space-y-2 max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <li
              key={notif.notification_id}
              className={`p-3 flex items-start gap-3 rounded-lg transition relative cursor-pointer 
                ${notif.is_read || notif.status
                  ? "bg-white"
                  : "bg-gray-100 hover:bg-gray-200 font-gold border-l-4 border-blue-500"
                }`}
              onClick={() => {
                if (!notif.is_read && !notif.status) {
                  markAsRead(notif.notification_id);
                  console.log(
                    "Mark as read:",
                    notif.notification_type ||
                    notif.notificationType ||
                    notif.Notification.notification_type
                  );
                }
                if (
                  notif.notification_type === "tag" ||
                  notif.notificationType === "tag" ||
                  notif.Notification.notification_type === "tag"
                ) {
                  tagNavigate(notif.Notification.message || notif.message);
                }
              }}
            >
              {getIcon(notif.notification_type)}
              <div>
                <p>{notif.Notification.message}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(notif.Notification.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.notification_id);
                }}
                className="absolute right-3 top-3 text-red-500 hover:text-red-700"
              >
                ✖
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-center py-3">
            Không có thông báo nào.
          </p>
        )}
      </ul>
      <ToastContainer /> {/* Thêm ToastContainer để hiển thị toast */}
    </div>
  );
};

export default Notifications;

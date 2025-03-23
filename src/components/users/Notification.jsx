import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast, ToastContainer } from "react-toastify"; // Thêm toast
import "react-toastify/dist/ReactToastify.css"; // Thêm CSS cho toast
import NotificationService from "../../services/NotificationService";
import { Bell, Tag, Users, Settings } from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const socket = io(BASE_URL);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) return;
    setUserId(user.id);
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
      socket.emit("markNotificationAsRead", notificationId);
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
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

  return (
    <div className="w-96 p-4 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Bell className="text-indigo-500 w-6 h-6" /> Thông báo
        </h2>
        {notifications.length > 0 && (
          <button
            onClick={deleteAllNotifications}
            className="text-red-500 text-sm hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      <ul className="space-y-2 max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <li
              key={notif.notification_id}
              className={`p-3 flex items-start gap-3 rounded-lg transition relative cursor-pointer 
                ${
                  notif.is_read || notif.status
                    ? "bg-white"
                    : "bg-gray-100 hover:bg-gray-200 font-gold border-l-4 border-blue-500"
                }`}
              onClick={() => {
                if (!notif.is_read && !notif.status) {
                  markAsRead(notif.notification_id);
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
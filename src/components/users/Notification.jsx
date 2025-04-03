import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";

import { toast, ToastContainer } from "react-toastify"; // Thêm toast
import "react-toastify/dist/ReactToastify.css"; // Thêm CSS cho toast
import NotificationService from "../../services/notificationService";
import { Bell, Tag, Users, Settings } from "lucide-react";
import { connectSocket, socket } from "../../hooks/useSocket";
import { fetchStudentCourses } from "../../services/courseServices";
import { useNavigate } from "react-router-dom";
import useUserId from "../../hooks/useUserId";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const userId = useUserId();

  const navigate = useNavigate();
  useEffect(() => {
    if (!userId) return;
    connectSocket();
    socket.emit("registerUser", userId);
    const fetchNotifications = async () => {
      if (!userId) return;
      try {
        console.log("🔔 Lấy thông báo cho userId:", userId);
        const response = await NotificationService.getNotifications(userId);
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
    fetchNotifications();

    socket.on("receiveNotification", handleNotification);
    socket.on("notificationDeleted", handleDeleteNotification);

    // Lắng nghe toast notification từ socket
    socket.on("toastNotification", handleToastNotification);

    return () => {
      socket.off("receiveNotification", handleNotification);
      socket.off("notificationDeleted", handleDeleteNotification);
      socket.off("toastNotification", handleToastNotification);
    };
  }, [userId]);

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
        classroomId: notification.classroomId || notification.classroom_id,
        assignmentTitle: notification.assignmentTitle,
        lectureTitle: notification.lectureTitle,
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
  const tagNavigate2 = async (message) => {
    try {
      if (!message) {
        console.error("Message is undefined, cannot navigate.");
        return;
      }

      const regex = /Lớp (.+?) - (.+?) của bạn có tin nhắn mới!/;
      if (regex.test(message)) {
        let courseName = message.match(regex)[1];
        let className = message.match(regex)[2];
        let courses = await fetchStudentCourses();

        let course = courses.find(
          (c) =>
            c.Classroom.Course.course_name === courseName &&
            c.Classroom.Class.class_name === className
        );
        console.log("hehehe: ", courseName, className);
        if (course) {
          navigate(`/courseDetail/${course.classroom_id}/messages`);
        } else {
          console.error(`Không tìm thấy khóa học với tên: ${courseName}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi chuyển hướng:", error);
    }
  };
  const courseNavigate = async (message) => {
    try {
      if (!message) {
        console.error("Message is undefined, cannot navigate.");
        return;
      }
      const regex = message.match(/lớp\s(.+?)(,| vui lòng|$)/);
      
      const courseName = regex ? regex[1] : null;
      if (courseName) {

        let courses = await fetchStudentCourses();
        let course = courses.find(
          (c) => c.Classroom.Course.course_name === courseName
        );
        if (/bài tập\s(.+?)\s(của|vào)/.test(message)) {
          if (course) {
            navigate(`/courseDetail/${course.classroom_id}/assignments`);
          } else {
            console.error(`Không tìm thấy khóa học với tên: ${courseName}`);
          }
        } else if (/bài giảng\s(.+?)\s(của|lên)/.test(message)) {
          if (course) {
            navigate(`/courseDetail/${course.classroom_id}/lectures`);
          } else {
            console.error(`Không tìm thấy khóa học với tên: ${courseName}`);
          }
        }else if (/bài thi\s(.+?)\s/.test(message)){
          if (course) {
            navigate(`/courseDetail/${course.classroom_id}/list-exam`);
          } else {
            console.error(`Không tìm thấy khóa học với tên: ${courseName}`);
          }
        }
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
                ${
                  notif.is_read || notif.status
                    ? "bg-white"
                    : "bg-gray-100 hover:bg-gray-200 font-gold border-l-4 border-blue-500"
                }`}
              onClick={() => {
                tagNavigate2(notif.Notification.message);
                courseNavigate(notif.Notification.message);
                if (!notif.is_read && !notif.status) {
                  markAsRead(notif.notification_id);
                }
                if (
                  notif.notification_type === "tag" ||
                  notif.notificationType === "tag" ||
                  notif.Notification.notification_type === "tag"
                ) {
                  tagNavigate(notif.Notification.message || notif.message);
                }
                if (notif.classroomId) {
                  navigate(`/courseDetail/${notif.classroomId}/messages`);
                }
                if (notif.assignmentTitle) {
                  navigate(`/courseDetail/${notif.classroomId}/assignments`);
                }
                if (notif.lectureTitle) {
                  navigate(`/courseDetail/${notif.classroomId}/lectures`);
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
              <div className="flex-shrink-0 flex-1 justify-end flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.notification_id);
                  }}
                  className="text-red-500 hover:text-red-700 ml-auto text-[10px]"
                >
                  xóa
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-center py-3">
            Không có thông báo nào.
          </p>
        )}
      </ul>
    </div>
  );
};

export default Notifications;

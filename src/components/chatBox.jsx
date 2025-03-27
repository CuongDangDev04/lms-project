import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import {
  fetchMessages,
  sendMessage,
  deleteMessage,
} from "../services/chatService";
import ClassService from "../services/ClassService";
import NotificationService from "../services/notificationService";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const socket = io(BASE_URL);
const ChatBox = ({ userId }) => {
  const { classroomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showDeleteId, setShowDeleteId] = useState(null);

  // Format thời gian

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Khởi tạo socket và fetch data
  useEffect(() => {
    socket.emit("joinRoom", { classroomId });

    fetchMessages(classroomId)
      .then((data) => {
        const sortedMessages = data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
      })
      .catch((err) => console.error("Lỗi tải tin nhắn:", err));

    socket.on("receiveMessage", (message) => {
      // if (classroomId !== message.classroomId) return;
      setMessages((prev) =>
        [...prev, message].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
      );
    });

    const fetchUsers = async () => {
      try {
        const res = await ClassService.getAllUserInClass(classroomId);
        if (res.data.students) {
          const formattedUsers = res.data.students.map((student) => ({
            username: student.username,
            user_id: student.Classrooms[0]?.user_participation?.user_id,
            fullname: student.fullname,
            avt: student.avt,
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách user:", error);
      }
    };

    fetchUsers();

    return () => {
      socket.off("receiveMessage");
    };
  }, [classroomId]);

  // Xử lý xóa tin nhắn qua socket
  useEffect(() => {
    const handleDeleteMessage = (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg.message_id !== messageId));
    };
    socket.on("messageDeleted", handleDeleteMessage);
    return () => socket.off("messageDeleted", handleDeleteMessage);
  }, []);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    let tagMatches = newMessage.match(/@(\w+)/g) || [];
    let taggedUsernames = tagMatches.map((tag) => tag.slice(1));
    let taggedUserIds = users
      .filter((user) => taggedUsernames.includes(user.username))
      .map((user) => user.user_id);
    const messageData = { classroomId, userId, message: newMessage };
    const tagNotificationData = { classroomId, taggedUserIds };
    try {
      await sendMessage(messageData);
      if (taggedUserIds.length > 0) {
        await NotificationService.sendTagNotification(tagNotificationData);
      }
      setNewMessage("");
      setMentionSuggestions([]);
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  // Xóa tin nhắn
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      socket.emit("deleteMessage", messageId);
      setShowDeleteId(null);
    } catch (error) {
      console.error("Lỗi xóa tin nhắn:", error);
    }
  };

  // Xử lý input
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    const match = e.target.value.match(/@(\w*)$/);
    if (match) {
      setMentionSuggestions(
        users.filter(
          (u) =>
            (u.fullname.toLowerCase().startsWith(match[1].toLowerCase()) ||
              u.username.toLowerCase().startsWith(match[1].toLowerCase())) &&
            u.user_id !== userId
        )
      );
    } else {
      setMentionSuggestions([]);
    }
  };

  // Chọn user từ gợi ý mention
  const handleSelectUser = (username) => {
    setNewMessage((prev) => prev.replace(/@\w*$/, `@${username} `));
    setMentionSuggestions([]);
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Xử lý phím
  const handleKeyDown = (e) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === mentionSuggestions.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? mentionSuggestions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelectUser(mentionSuggestions[selectedIndex].username);
      }
    } else if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Context menu cho xóa tin nhắn
  const handleContextMenu = (e, messageId) => {
    e.preventDefault();
    setShowDeleteId(messageId);
  };

  return (
    <div className="flex flex-col  h-[90vh] w-full max-w-full   mx-auto bg-white shadow-xl border border-gray-100">
      {/* Messages */}
      <div className="flex-1 p-5 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm mt-10">
            Chưa có tin nhắn nào...
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser =
              msg.userId === userId ||
              msg.user_id === userId ||
              msg.User?.userId === userId;

            // Tìm thông tin user từ danh sách users để lấy avatar
            const sender = users.find(
              (u) =>
                u.user_id === msg.userId ||
                u.user_id === msg.user_id ||
                u.user_id === msg.User?.userId
            );

            return (
              <div
                key={msg.message_id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                } mb-4`}
                onContextMenu={(e) =>
                  isCurrentUser && handleContextMenu(e, msg.message_id)
                }
              >
                <div className="flex items-end gap-2 max-w-[70%]">
                  {!isCurrentUser && (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {sender?.avt ? (
                        <img
                          src={sender.avt}
                          alt={sender?.username || "User"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none"; // Ẩn ảnh nếu lỗi
                            e.target.nextSibling.style.display = "flex"; // Hiển thị fallback
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium shadow-md ${
                          sender?.avt ? "hidden" : "flex"
                        }`}
                      >
                        {msg.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                    </div>
                  )}
                  <div
                    className={`relative p-3 rounded-2xl ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    } shadow-md`}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold ${
                          isCurrentUser ? "text-indigo-100" : "text-indigo-600"
                        }`}
                      >
                        {!isCurrentUser && (msg.User?.fullname || msg.fullname)}
                      </span>

                      <div className="flex items-center">
                        {msg.taggedUsers && msg.taggedUsers.length > 0 && (
                          <span className="text-cyan-300 font-bold mr-1 inline-flex">
                            {msg.taggedUsers.map((user, i) => (
                              <span key={i}>@{user.username}</span>
                            ))}
                          </span>
                        )}
                        <span className="text-sm break-words">
                          {msg.message}
                        </span>
                      </div>
                      <span
                        className={`text-xs ${
                          isCurrentUser ? "text-indigo-200" : "text-gray-500"
                        }`}
                      >
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    {isCurrentUser && showDeleteId === msg.message_id && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all shadow-sm"
                        onClick={() => handleDeleteMessage(msg.message_id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="relative flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Gửi tin nhắn..."
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
          {mentionSuggestions.length > 0 && (
            <ul className="absolute bottom-full left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mb-2 z-20">
              {mentionSuggestions.map((user, index) => (
                <li
                  key={user.user_id}
                  onClick={() => handleSelectUser(user.username)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-all ${
                    index === selectedIndex
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-indigo-600">
                    @{user.fullname}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

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
  const chatBoxRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState(null);
  const [reply, setReply] = useState(null);
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
    document.title = "Tin nhắn lớp học - BrainHub";
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
        [...prev, { ...message, status: message.status ?? 1 }].sort(
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

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    if (!message.userId && !message.user_id) return;

    // if (message.userId !== userId && message.user_id !== userId) return;
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: message.message_id || message.messageId,
    });
  };
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  useEffect(() => {
    if (contextMenu && chatBoxRef.current) {
      chatBoxRef.current.style.overflow = "hidden";
    } else if (chatBoxRef.current) {
      chatBoxRef.current.style.overflow = "";
    }

    return () => {
      if (chatBoxRef.current) chatBoxRef.current.style.overflow = "";
    };
  }, [contextMenu]);
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.message_id === contextMenu.messageId ? { ...msg, status: 0 } : msg
        )
      );
    } catch (error) {
      console.error(error);
    }
    setContextMenu(null);
  };

  useEffect(() => {
    const handleDeleteMessage = (messageId) => {
      fetchMessages(classroomId)
        .then((data) => {
          const sortedMessages = data.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          const showMessage = sortedMessages.map((msg) =>
            msg.message_id === messageId ? { ...msg, status: 0 } : msg
          );
          setMessages(showMessage);
        })
        .catch((err) => console.error("Lỗi tải tin nhắn:", err));
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
    let messageData = {};
    if (reply) {
      messageData = {
        classroomId,
        userId,
        message: newMessage,
        reply: reply.message_id || reply.messageId,
      };
    } else if (!reply) {
      messageData = {
        classroomId,
        userId,
        message: newMessage,
      };
    }
    const tagNotificationData = { classroomId, taggedUserIds };
    try {
      await sendMessage(messageData);
      if (taggedUserIds.length > 0) {
        await NotificationService.sendTagNotification(tagNotificationData);
      }
      setNewMessage("");
      setMentionSuggestions([]);
      handleCancelReply();
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  // Xóa tin nhắn
  // const handleDeleteMessage = async (messageId) => {
  //   try {
  //     await deleteMessage(messageId);
  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg.message_id === messageId ? { ...msg, status: 0 } : msg
  //       )
  //     );
  //     setShowDeleteId(null);
  //   } catch (error) {
  //     console.error("Lỗi xóa tin nhắn:", error);
  //   }
  // };

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
  const addSelectUserInReply = (username) => {
    setNewMessage((prev) => (prev ? `${prev} @${username} ` : `@${username} `));
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
    } else if (e.key === "Escape") {
      handleCancelReply();
    }
  };
  useEffect(() => {
    if (!reply) return;
  }, [reply]);
  const handleCancelReply = () => {
    try {
      setReply();
      setNewMessage("");
    } catch (error) {
      console.error("Lỗi rồi bạn êy: ", error);
    }
  };
  return (
    <div className="flex flex-col  h-[90vh] md:h-[100vh] w-full max-w-full   mx-auto bg-white shadow-xl border border-gray-100 ">
      {selectedMessageDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Chi tiết tin nhắn
            </h2>
            <p className="text-gray-700">{selectedMessageDetail.message}</p>
            <div className="mt-3 text-sm text-gray-500">
              <strong>Người gửi:</strong>{" "}
              {selectedMessageDetail.fullname || selectedMessageDetail.username}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              <strong>Thời gian:</strong>{" "}
              {formatTimestamp(selectedMessageDetail.timestamp)}
            </div>
            <button
              onClick={() => setSelectedMessageDetail(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {/* Messages */}
      <div
        className="flex-1 p-5 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hidden-scrollbar"
        ref={chatBoxRef}
      >
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
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"
                  } mb-4`}
                onContextMenu={(e) =>
                  isCurrentUser && handleContextMenu(e, msg.message_id)
                }
              >
                <div
                  className="flex items-end gap-2 max-w-[70%]"
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                >
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
                        className={`w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium shadow-md ${sender?.avt ? "hidden" : "flex"
                          }`}
                      >
                        {msg.username?.charAt(0).toUpperCase() || "?"}
                      </div>
                    </div>
                  )}
                  <div
                    className={`relative p-3 rounded-2xl ${isCurrentUser
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                      } shadow-md`}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-semibold ${isCurrentUser ? "text-indigo-100" : "text-indigo-600"
                          }`}
                      >
                        {!isCurrentUser && (msg.User?.fullname || msg.fullname)}
                      </span>

                      <div className="flex flex-col items-start">
                        {msg.reply_message && msg.status !== 0 && (
                          <div className="flex flex-col p-2 mb-2 text-sm rounded-lg bg-gray-200 text-gray-700 border-l-4 border-blue-400">
                            <span className="font-semibold text-blue-600">
                              {msg.reply_fullname}
                            </span>
                            <span className="ml-1 italic">
                              {msg.reply_message}
                            </span>
                          </div>
                        )}
                        <div>
                          {msg.taggedUsers &&
                            msg.taggedUsers.length > 0 &&
                            msg.status !== 0 && (
                              <span className="text-cyan-300 font-bold mr-1 inline-flex">
                                {msg.taggedUsers.map((user, i) => (
                                  <span key={i}>@{user.username}</span>
                                ))}
                              </span>
                            )}
                          <span className="text-sm break-words">
                            {msg.status === 0 ? (
                              <span className="italic text-gray-400">
                                Tin nhắn đã thu hồi
                              </span>
                            ) : (
                              msg.message
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs ${isCurrentUser ? "text-indigo-200" : "text-gray-500"
                          }`}
                      >
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Context Menu */}
                {contextMenu &&
                  contextMenu.messageId === msg.message_id &&
                  msg.status === 1 && (
                    <ul
                      className="absolute bg-white border border-gray-300 shadow-xl rounded-lg py-2 text-sm w-48 z-50"
                      style={{
                        top: contextMenu.y,
                        left: Math.min(contextMenu.x, window.innerWidth - 250), // Giới hạn vị trí để không tràn
                        maxWidth: "calc(100vw - 20px)", // Giới hạn để không tràn màn hình
                      }}
                    >
                      {isCurrentUser && (
                        <li
                          onClick={() =>
                            handleDeleteMessage(contextMenu.messageId)
                          }
                          className="px-4 py-2 hover:bg-red-100 hover:text-red-600 cursor-pointer transition-all duration-200"
                        >
                          Thu hồi tin nhắn
                        </li>
                      )}
                      <li
                        onClick={() => setSelectedMessageDetail(msg)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                      >
                        Xem chi tiết
                      </li>
                      <li
                        onClick={() => {
                          setReply(msg);
                          if (!isCurrentUser) {
                            addSelectUserInReply(msg.username);
                          }
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                      >
                        Trả lời
                      </li>
                    </ul>
                  )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
        <div className="relative flex gap-3">
          <div className="flex-column flex-1">
            {reply && (
              <div className="flex items-center bg-gray-100 p-2 rounded-lg relative">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">
                    Đang trả lời{" "}
                    {(reply.userId || reply.user_id) !== userId && (
                      <span className="font-semibold text-gray-700">
                        @{reply.fullname}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {reply.message}
                  </p>
                </div>
                <button
                  onClick={handleCancelReply}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex mt-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Gửi tin nhắn..."
                className="flex-1 p-3 mr-1 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm text-gray-800 placeholder-gray-400 transition-all"
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
            </div>
          </div>

          {mentionSuggestions.length > 0 && (
            <ul className="absolute bottom-full left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto mb-2 z-20">
              {mentionSuggestions.map((user, index) => (
                <li
                  key={user.user_id}
                  onClick={() => handleSelectUser(user.username)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-all ${index === selectedIndex
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

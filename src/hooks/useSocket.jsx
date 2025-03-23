import { io } from "socket.io-client";

// Định nghĩa URL của server backend (có thể dùng biến môi trường)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Khởi tạo socket chỉ một lần duy nhất
const socket = io(BASE_URL, {
  autoConnect: false, // Không tự động kết nối, sẽ connect khi cần
  reconnection: true, // Tự động kết nối lại nếu mất kết nối
  reconnectionAttempts: 5, // Số lần thử lại nếu mất kết nối
  reconnectionDelay: 3000, // Độ trễ giữa các lần thử lại (ms)
});

// Hàm kết nối socket khi cần
const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
    console.log("✅ Socket kết nối:", BASE_URL);
  }
};

// Hàm ngắt kết nối socket
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("❌ Socket ngắt kết nối");
  }
};
export { socket, connectSocket, disconnectSocket };

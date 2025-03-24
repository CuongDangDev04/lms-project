import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/user/logo.jpg";
import {
  forgotPassword,
  login,
  resetPassword,
} from "../../services/authServices";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import img_login from "../../assets/user/img_login.png";
import img_login2 from "../../assets/user/img_Login2.png";
import img_login3 from "../../assets/user/img_login3.png";
import img_login4 from "../../assets/user/img_login4.png";
import LoadingBar from "../../components/users/LoadingBar";

const images = [img_login, img_login2, img_login3, img_login4];

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // State cho modal quên mật khẩu
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Thêm state cho nhập lại mật khẩu
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Thêm state để hiển thị/ẩn confirm password

  // Tự động chuyển đổi hình ảnh mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(username, password);
      toast.success("Đăng nhập thành công");
      const user = JSON.parse(localStorage.getItem("user"));
      const roleId = user?.role_id;

      setTimeout(() => {
        if (roleId === 1) navigate("/");
        else if (roleId === 3) navigate("/admin");
        else navigate("/");

      }, 1000);
    } catch (error) {
      toast.error(error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi yêu cầu quên mật khẩu
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast.success("Mã xác nhận đã được gửi đến email của bạn!");
      setForgotPasswordStep(2);
    } catch (error) {
      toast.error(error.message || "Gửi mã xác nhận thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Kiểm tra mật khẩu mới và nhập lại mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(forgotEmail, resetCode, newPassword); // Chỉ gửi newPassword lên server
      toast.success("Đổi mật khẩu thành công!");
      setShowForgotPasswordModal(false);
      setForgotPasswordStep(1);
      setForgotEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword(""); // Reset confirm password
    } catch (error) {
      toast.error(error.message || "Đổi mật khẩu thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 p-4">
      <LoadingBar isLoading={isLoading} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Form đăng nhập */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <img alt="logo" className="w-32 mx-auto mb-4" src={logo} />
            <h2 className="text-4xl h-16 font-bold text-gray-800 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Đăng Nhập
            </h2>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                placeholder=" "
              />
              <label
                htmlFor="username"
                className={`absolute left-4 text-gray-500 transition-all duration-300 
                  ${username
                    ? "-top-2 text-sm text-gray-500 bg-white px-1"
                    : "top-1/2 -translate-y-1/2"
                  }
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
              >
                MSSV
              </label>
            </div>

            <div className="relative group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute left-4 text-gray-500 transition-all duration-300 
                  ${password
                    ? "-top-2 text-sm text-gray-500 bg-white px-1"
                    : "top-1/2 -translate-y-1/2"
                  }
                  peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
              >
                Mật khẩu
              </label>
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </span>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Quên mật khẩu?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Đăng Nhập
            </motion.button>
          </form>
        </div>

        {/* Ảnh minh họa */}
        <div className="hidden md:block w-1/2 bg-gradient-to-r from-blue-400 to-blue-600 p-8 relative overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                alt="Login Illustration"
                className="w-[80%] h-[300px] object-cover rounded-lg drop-shadow-xl"
                src={images[currentImageIndex]}
              />
            </AnimatePresence>

            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-800/70 hover:text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 z-10 cursor-pointer"
            >
              ❮
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/80 text-gray-800/70 hover:text-gray-800 rounded-full p-2 shadow-md transition-all duration-300 z-10 cursor-pointer"
            >
              ❯
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`w-3 h-3 rounded-full ${currentImageIndex === index ? "bg-white" : "bg-white/50"
                    } transition-all duration-300`}
                />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>
      </motion.div>

      {/* Modal Quên Mật Khẩu */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-lg p-8 w-full max-w-md relative shadow-xl"
            >
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>

              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Quên Mật Khẩu
              </h3>

              {forgotPasswordStep === 1 ? (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="relative group">
                    <input
                      id="forgotEmail"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                      placeholder=" "
                    />
                    <label
                      htmlFor="forgotEmail"
                      className={`absolute left-4 text-gray-500 transition-all duration-300 
                        ${forgotEmail
                          ? "-top-2 text-sm text-gray-500 bg-white px-1"
                          : "top-1/2 -translate-y-1/2"
                        }
                        peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
                    >
                      Email
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Gửi Mã Xác Nhận
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="relative group">
                    <input
                      id="forgotEmailDisplay"
                      type="email"
                      value={forgotEmail}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 cursor-not-allowed"
                    />
                    <label
                      htmlFor="forgotEmailDisplay"
                      className="absolute left-4 -top-2 text-sm text-gray-500 bg-white px-1"
                    >
                      Email
                    </label>
                  </div>

                  <div className="relative group">
                    <input
                      id="resetCode"
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                      placeholder=" "
                    />
                    <label
                      htmlFor="resetCode"
                      className={`absolute left-4 text-gray-500 transition-all duration-300 
                        ${resetCode
                          ? "-top-2 text-sm text-gray-500 bg-white px-1"
                          : "top-1/2 -translate-y-1/2"
                        }
                        peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
                    >
                      Mã Xác Nhận
                    </label>
                  </div>

                  <div className="relative group">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                      placeholder=" "
                    />
                    <label
                      htmlFor="newPassword"
                      className={`absolute left-4 text-gray-500 transition-all duration-300 
                        ${newPassword
                          ? "-top-2 text-sm text-gray-500 bg-white px-1"
                          : "top-1/2 -translate-y-1/2"
                        }
                        peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
                    >
                      Mật Khẩu Mới
                    </label>
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors"
                    >
                      {showNewPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </span>
                  </div>

                  <div className="relative group">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-300 peer"
                      placeholder=" "
                    />
                    <label
                      htmlFor="confirmPassword"
                      className={`absolute left-4 text-gray-500 transition-all duration-300 
                        ${confirmPassword
                          ? "-top-2 text-sm text-gray-500 bg-white px-1"
                          : "top-1/2 -translate-y-1/2"
                        }
                        peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
                    >
                      Nhập Lại Mật Khẩu
                    </label>
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Đặt Lại Mật Khẩu
                  </motion.button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/user/logo-removebg.png";
import { FaArrowLeft } from "react-icons/fa";

export const NotFound = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen w-full flex flex-col items-center justify-center  text-gray-800 p-6"
    >
      {/* Nội dung chính */}
      <div className="flex flex-col items-center space-y-12">
        {/* Logo */}
        <motion.div variants={itemVariants} className="relative">
          <img
            alt="logo"
            className="relative w-48 md:w-64  bg-transparent  transform hover:scale-105 transition-transform duration-300"
            src={logo}
          />
        </motion.div>

        {/* Tiêu đề 404 */}
        <motion.h1
          variants={itemVariants}
          className="text-9xl md:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-lg"
        >
          404
        </motion.h1>

        {/* Thông báo */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h2 className="text-2xl md:text-4xl font-semibold tracking-wide text-gray-800">
            Oops! Trang không tìm thấy
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
            Có vẻ như bạn đã đi lạc. Đừng lo, chúng ta sẽ đưa bạn về trang chủ ngay!
          </p>
        </motion.div>

        {/* Nút quay về */}
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackHome}
          className="group relative px-10 py-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full text-lg font-semibold text-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shine" />
          <div className="relative flex items-center space-x-3">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span>Trở Về Trang Chủ</span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
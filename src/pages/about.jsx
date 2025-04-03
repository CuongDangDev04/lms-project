import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaBookOpen, FaRocket } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const About = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-gray-200">
            {/* SEO Optimization */}
            <Helmet>
                <title>Giới Thiệu Về BrainHub - Hệ Thống LMS Trường Đại Học 2025</title>
                <meta name="description" content="Tìm hiểu về BrainHub - Hệ thống LMS tiên tiến cho sinh viên và giảng viên đại học, mang đến giải pháp học trực tuyến hiệu quả." />
                <meta name="keywords" content="BrainHub LMS, giới thiệu BrainHub, học trực tuyến, LMS đại học, giáo dục 2025" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="BrainHub Team" />
                <link rel="canonical" href="https://lmsclient-nine.vercel.app/about" />
                <meta property="og:title" content="Giới Thiệu Về BrainHub - Hệ Thống LMS Trường Đại Học 2025" />
                <meta property="og:description" content="Tìm hiểu về BrainHub - Hệ thống LMS tiên tiến cho sinh viên và giảng viên đại học." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" />
                <meta property="og:url" content="https://lmsclient-nine.vercel.app/about" />
                <meta property="og:type" content="website" />
            </Helmet>

            {/* Header */}
            <header className="w-full bg-white shadow-md fixed top-0 z-50">
                <div className="container mx-auto flex items-center justify-between py-4 px-4 sm:px-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">BrainHub</h1>
                    <button className="md:hidden text-gray-700 focus:outline-none" onClick={toggleMenu} aria-label="Mở menu điều hướng">
                        {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
                    </button>
                    <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-base">Trang Chủ</Link>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-base">Giới Thiệu</Link>
                        <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-base">Blog</Link>
                    </nav>
                    <Link to="/login" className="hidden md:block px-6 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 font-semibold text-base" rel="nofollow">Đăng Nhập</Link>
                </div>
                <div className={`md:hidden bg-white shadow-md transition-all duration-300 ${isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                    <nav className="flex flex-col items-center space-y-4 py-4" role="navigation" aria-label="Mobile navigation">
                        <Link to="/" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Trang Chủ</Link>
                        <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Giới Thiệu</Link>
                        <Link to="/blog" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                        <Link to="/login" className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 font-semibold text-base" rel="nofollow" onClick={() => setIsMenuOpen(false)}>Đăng Nhập</Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-20">
                <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] max-h-[500px] flex items-center justify-center text-center">
                    <img
                        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Giới thiệu BrainHub"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    <div className="relative z-10 text-white p-4 sm:p-6 md:p-8 w-full max-w-4xl">
                        <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-4 tracking-tight">Giới Thiệu Về BrainHub</h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6">BrainHub - Hệ thống LMS tiên tiến nhất dành cho giáo dục đại học, mang đến trải nghiệm học tập trực tuyến tối ưu cho sinh viên và giảng viên.</p>
                    </div>
                </section>

                {/* Our Mission Section */}
                <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">Sứ Mệnh Của BrainHub</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: <FaGraduationCap className="text-4xl text-blue-600" />, title: "Hỗ Trợ Sinh Viên", desc: "Cung cấp nền tảng học tập trực tuyến giúp sinh viên dễ dàng tiếp cận tài liệu, bài giảng và kỳ thi mọi lúc, mọi nơi." },
                            { icon: <FaBookOpen className="text-4xl text-blue-600" />, title: "Nâng Cao Chất Lượng Giáo Dục", desc: "Đưa công nghệ hiện đại vào giáo dục đại học, giúp giảng viên và sinh viên tương tác hiệu quả hơn." },
                            { icon: <FaRocket className="text-4xl text-blue-600" />, title: "Đổi Mới Không Ngừng", desc: "Liên tục cập nhật và phát triển các tính năng mới để đáp ứng nhu cầu học tập hiện đại." },
                        ].map((mission, index) => (
                            <div key={index} className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                                <div className="mb-4">{mission.icon}</div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-600 mb-3">{mission.title}</h3>
                                <p className="text-gray-600 text-base sm:text-lg">{mission.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Our Team Section */}
                <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">Đội Ngũ Của Chúng Tôi</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { name: "Nguyễn Văn A", role: "CEO & Nhà Sáng Lập", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
                            { name: "Trần Thị B", role: "Giám Đốc Công Nghệ", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
                            { name: "Lê Văn C", role: "Trưởng Phòng Giáo Vụ", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
                        ].map((member, index) => (
                            <div key={index} className="p-4 sm:p-6 bg-white shadow-md rounded-xl text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                                <img src={member.image} alt={`Ảnh đại diện của ${member.name}`} className="w-16 h-16 rounded-full mx-auto mb-4" loading="lazy" />
                                <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">{member.name}</h4>
                                <p className="text-gray-600 text-sm sm:text-base">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action Section */}
                <section className="container mx-auto my-16 sm:my-20 px-4 sm:px-6 py-12 bg-blue-600 text-white rounded-xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="w-full md:w-1/2 text-center md:text-left p-6" data-aos="fade-up">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Sẵn Sàng Trải Nghiệm BrainHub?</h2>
                            <p className="text-base sm:text-lg md:text-xl mb-6 max-w-lg mx-auto md:mx-0">Đăng nhập ngay để khám phá hệ thống LMS tiên tiến nhất cho sinh viên và giảng viên đại học.</p>
                            <Link to="/login" className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 text-base sm:text-lg font-semibold" data-aos="zoom-in" data-aos-delay="200" rel="nofollow">Đăng Nhập Ngay</Link>
                        </div>
                        <div className="w-full md:w-1/2 p-6" data-aos="fade-up" data-aos-delay="300">
                            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" alt="BrainHub LMS" className="w-full h-64 sm:h-72 rounded-lg shadow-lg object-cover" loading="lazy" />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 mb-4">BrainHub</h3>
                        <p className="text-gray-400 text-base sm:text-lg">BrainHub - Hệ thống LMS hàng đầu dành cho giáo dục đại học, mang đến giải pháp học trực tuyến toàn diện cho sinh viên và giảng viên.</p>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Liên Kết Nhanh</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-base sm:text-lg">Trang Chủ</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-base sm:text-lg">Giới Thiệu</Link></li>
                            <li><Link to="/blog" className="text-gray-400 hover:text-blue-400 transition-all duration-300 text-base sm:text-lg">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Liên Hệ</h3>
                        <p className="text-gray-400 mb-2 text-base sm:text-lg">Email: support@brainhub.com</p>
                        <p className="text-gray-400 mb-2 text-base sm:text-lg">Điện thoại: +84 123 456 789</p>
                        <p className="text-gray-400 text-base sm:text-lg">Địa chỉ: Trường Đại Học Nguyễn Tất Thành, TP.HCM, Việt Nam</p>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-4">Kết Nối Với Chúng Tôi</h3>
                        <div className="flex space-x-4 mb-6">
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-all duration-300" aria-label="Facebook của BrainHub"><FaFacebookF className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-all duration-300" aria-label="Twitter của BrainHub"><FaTwitter className="w-6 h-6" /></a>
                            <a href="#" className="text-gray-400 hover:text-blue-400 transition-all duration-300" aria-label="LinkedIn của BrainHub"><FaLinkedinIn className="w-6 h-6" /></a>
                        </div>
                        <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 font-semibold text-base sm:text-lg" rel="nofollow">Đăng Nhập Ngay</Link>
                    </div>
                </div>
                <div className="container mx-auto mt-8 pt-6 border-t border-gray-700 text-center">
                    <p className="text-base sm:text-lg text-gray-400">© 2025 BrainHub LMS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
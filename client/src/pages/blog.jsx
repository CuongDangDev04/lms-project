import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Blog = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const blogPosts = [
        {
            title: "5 Mẹo Sử Dụng BrainHub Hiệu Quả Để Tăng Hiệu Suất Học Tập",
            excerpt: "Tìm hiểu cách tối ưu hóa việc học trực tuyến với BrainHub, từ quản lý thời gian đến tận dụng tài liệu giảng dạy hiệu quả.",
            image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            link: "/blog/5-meo-hoc-online",
            date: "2025-03-20",
            category: "Học Tập",
        },
        {
            title: "Khóa Học Mới Nhất 2025 Trên BrainHub: Đột Phá Trong Giáo Dục Đại Học",
            excerpt: "Khám phá các khóa học mới nhất trên BrainHub năm 2025, được thiết kế để đáp ứng nhu cầu học tập hiện đại.",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            link: "/blog/khoa-hoc-moi-2025",
            date: "2025-03-15",
            category: "Khóa Học",
        },
        {
            title: "Lợi Ích Của BrainHub Trong Giáo Dục Đại Học: Tại Sao Bạn Nên Thử?",
            excerpt: "BrainHub mang lại sự linh hoạt tối đa cho việc học trực tuyến, thay đổi cách sinh viên và giảng viên tương tác.",
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            link: "/blog/loi-ich-hoc-truc-tuyen",
            date: "2025-03-10",
            category: "Giáo Dục",
        },
    ];

    const fallbackImage = "https://via.placeholder.com/1350x600?text=Image+Not+Found";

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-gray-200">
            {/* SEO Optimization */}
            <Helmet>
                <title>Blog BrainHub - Tin Tức & Mẹo Học Tập Hữu Ích 2025</title>
                <meta name="description" content="Khám phá blog của BrainHub với các bài viết về mẹo học tập, khóa học mới, và lợi ích của LMS trong giáo dục đại học." />
                <meta name="keywords" content="BrainHub blog, mẹo học tập, khóa học 2025, LMS đại học, giáo dục trực tuyến" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="BrainHub Team" />
                <link rel="canonical" href="https://lmsclient-nine.vercel.app/blog" />
                <meta property="og:title" content="Blog BrainHub - Tin Tức & Mẹo Học Tập Hữu Ích 2025" />
                <meta property="og:description" content="Khám phá blog của BrainHub với các bài viết về mẹo học tập, khóa học mới, và lợi ích của LMS." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" />
                <meta property="og:url" content="https://lmsclient-nine.vercel.app/blog" />
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
                        src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Blog BrainHub"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                    <div className="relative z-10 text-white p-4 sm:p-6 md:p-8 w-full max-w-4xl">
                        <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-4 tracking-tight">Blog BrainHub</h1>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6">Khám phá các bài viết hữu ích về học tập trực tuyến, khóa học mới, và lợi ích của BrainHub trong giáo dục đại học.</p>
                    </div>
                </section>

                {/* Blog Posts Section */}
                <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">Tin Tức & Bài Viết Mới Nhất</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {blogPosts.map((post, index) => (
                            <div key={index} className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                                <img src={post.image || fallbackImage} alt={`Hình ảnh bài viết: ${post.title}`} className="w-full h-48 object-cover" loading="lazy" onError={(e) => (e.target.src = fallbackImage)} />
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-500">{post.date}</span>
                                        <span className="text-sm text-blue-600 font-semibold">{post.category}</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
                                    <p className="text-gray-600 mb-4 text-base sm:text-lg line-clamp-3">{post.excerpt}</p>
                                    <Link to={post.link} className="text-blue-600 hover:underline font-medium text-base sm:text-lg">Đọc Thêm →</Link>
                                </div>
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

export default Blog;
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "aos/dist/aos.css";
import AOS from "aos";
import { useEffect, useState } from "react";
import { FaGraduationCap, FaBookOpen, FaRocket, FaQuestionCircle, FaBars, FaTimes, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Landing = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const [stats, setStats] = useState({ students: 0, lecturers: 0, courses: 0, satisfaction: 0 });

    useEffect(() => {
        const targetStats = { students: 10000, lecturers: 500, courses: 1000, satisfaction: 98 };
        const duration = 1000;
        const interval = 20;
        const incrementStats = () => {
            setStats((prev) => {
                const newStats = { ...prev };
                Object.keys(targetStats).forEach((key) => {
                    if (newStats[key] < targetStats[key]) {
                        newStats[key] = Math.min(newStats[key] + Math.ceil(targetStats[key] / (duration / interval)), targetStats[key]);
                    }
                });
                return newStats;
            });
        };
        const timer = setInterval(incrementStats, interval);
        return () => clearInterval(timer);
    }, []);

    const blogPosts = [
        { title: "5 Mẹo Sử Dụng BrainHub Hiệu Quả Để Tăng Hiệu Suất Học Tập", excerpt: "Tìm hiểu cách tối ưu hóa việc học trực tuyến với BrainHub, từ quản lý thời gian đến tận dụng tài liệu giảng dạy hiệu quả.", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", link: "/blog/5-meo-hoc-online" },
        { title: "Khóa Học Mới Nhất 2025 Trên BrainHub: Đột Phá Trong Giáo Dục Đại Học", excerpt: "Khám phá các khóa học mới nhất trên BrainHub năm 2025, được thiết kế để đáp ứng nhu cầu học tập hiện đại.", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", link: "/blog/khoa-hoc-moi-2025" },
        { title: "Lợi Ích Của BrainHub Trong Giáo Dục Đại Học: Tại Sao Bạn Nên Thử?", excerpt: "BrainHub mang lại sự linh hoạt tối đa cho việc học trực tuyến, thay đổi cách sinh viên và giảng viên tương tác.", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", link: "/blog/loi-ich-hoc-truc-tuyen" },
    ];

    const testimonials = [
        { name: "Nguyễn Văn A - Sinh Viên Năm 3", quote: "BrainHub đã thay đổi hoàn toàn cách tôi học. Giao diện thân thiện, lịch học rõ ràng và tài liệu luôn sẵn sàng.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
        { name: "Trần Thị B - Giảng Viên Đại Học", quote: "Tôi rất ấn tượng với BrainHub. Việc theo dõi tiến độ học tập của sinh viên chưa bao giờ dễ dàng đến thế.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
        { name: "Lê Văn C - Quản Lý Giáo Vụ", quote: "BrainHub giúp tôi quản lý hàng trăm khóa học và lớp học một cách hiệu quả. Tính năng thống kê rất ấn tượng.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
    ];

    const faqs = [
        { question: "BrainHub là gì và nó hoạt động như thế nào?", answer: "BrainHub là hệ thống quản lý học tập (LMS) chuyên biệt cho sinh viên và giảng viên đại học, cung cấp các công cụ như quản lý khóa học, thi trực tuyến, lịch học, và tương tác trực tuyến." },
        { question: "Ai có thể sử dụng BrainHub và cách đăng ký?", answer: "BrainHub được thiết kế cho sinh viên và giảng viên đại học. Bạn cần tài khoản do trường cung cấp để truy cập. Liên hệ phòng giáo vụ để được cấp quyền." },
        { question: "BrainHub có những tính năng nổi bật nào để hỗ trợ học tập?", answer: "BrainHub hỗ trợ quản lý khóa học, thi trực tuyến, lịch học cá nhân hóa, tương tác giữa sinh viên và giảng viên, cùng hệ thống quản lý bài tập thông minh." },
        { question: "Làm thế nào để đăng nhập và bắt đầu với BrainHub?", answer: "Để đăng nhập, sử dụng thông tin tài khoản do trường đại học cung cấp. Truy cập trang chủ BrainHub, nhấp 'Đăng Nhập' để bắt đầu." },
    ];

    const fallbackImage = "https://via.placeholder.com/1920x1080";

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-gray-200">
            {/* SEO Optimization */}
            <Helmet>
                <title>BrainHub - Hệ Thống LMS Trường Đại Học Chuyên Nghiệp 2025</title>
                <meta name="description" content="BrainHub - Hệ thống LMS cho sinh viên & giảng viên đại học. Quản lý khóa học, thi online hiệu quả 2025." />
                <meta name="keywords" content="BrainHub LMS, học trực tuyến, LMS đại học, quản lý khóa học, thi online, giáo dục 2025" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="BrainHub Team" />
                <link rel="canonical" href="https://lmsclient-nine.vercel.app" />
                <meta property="og:title" content="BrainHub - Hệ Thống LMS Trường Đại Học Chuyên Nghiệp 2025" />
                <meta property="og:description" content="BrainHub mang đến giải pháp học trực tuyến toàn diện cho sinh viên và giảng viên đại học." />
                <meta property="og:image" content="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80" />
                <meta property="og:url" content="https://lmsclient-nine.vercel.app" />
                <meta property="og:type" content="website" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        "name": "BrainHub LMS",
                        "description": "Hệ thống LMS chuyên biệt cho sinh viên và giảng viên đại học tại Việt Nam.",
                        "url": "https://lmsclient-nine.vercel.app",
                        "logo": "https://lmsclient-nine.vercel.app/assets/logo-D4qMFEto.jpg",
                        "contactPoint": { "@type": "ContactPoint", "telephone": "+84-123-456-789", "contactType": "customer service", "email": "support@brainhub.com" },
                        "address": { "@type": "PostalAddress", "streetAddress": "Trường Đại Học Nguyễn Tất Thành", "addressLocality": "TP.HCM", "addressCountry": "VN" },
                    })}
                </script>
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

            <main className="pt-16 sm:pt-20">
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation
                    className="w-full h-[42vh] sm:h-[70vh] md:h-[80vh] max-h-[600px]"
                >
                    {[
                        {
                            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            title: "Chào Mừng Đến Với BrainHub LMS",
                            subtitle: "Hệ thống LMS tiên tiến nhất dành cho giáo dục đại học, mang đến trải nghiệm học tập trực tuyến tối ưu.",
                            buttonText: "Khám Phá Ngay",
                            buttonLink: "/courses",
                        },
                        {
                            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            title: "Quản Lý Lớp Học Hiệu Quả",
                            subtitle: "Giảng viên dễ dàng quản lý lịch học, bài tập và tiến độ sinh viên với giao diện trực quan.",
                            buttonText: "Đăng Nhập Ngay",
                            buttonLink: "/login",
                        },
                        {
                            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            title: "Học Tập Linh Hoạt Mọi Lúc",
                            subtitle: "Truy cập tài liệu, bài giảng và khóa học mọi lúc, mọi nơi trên mọi thiết bị với BrainHub.",
                            buttonText: "Bắt Đầu Học",
                            buttonLink: "/courses",
                        },
                        {
                            image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            title: "Thi Trực Tuyến Đơn Giản",
                            subtitle: "Tham gia kỳ thi online, nộp bài và nhận kết quả ngay tức thì với hệ thống BrainHub thông minh.",
                            buttonText: "Thử Ngay",
                            buttonLink: "/login",
                        },
                        {
                            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
                            title: "Tương Tác Trực Tuyến Hiệu Quả",
                            subtitle: "Kết nối với giảng viên và bạn học qua diễn đàn, chat và các công cụ tương tác hiện đại.",
                            buttonText: "Khám Phá Tính Năng",
                            buttonLink: "/courses",
                        },
                    ].map((slide, index) => (
                        <SwiperSlide key={index}>
                            <div className="relative w-full h-full flex items-center justify-center text-center">
                                {/* Ảnh nền */}
                                <img
                                    src={slide.image || fallbackImage}
                                    alt={slide.title}
                                    className="w-full h-full object-cover sm:max-h-none"
                                    loading="lazy"
                                    onError={(e) => (e.target.src = fallbackImage)}
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>

                                {/* Nội dung: Kiểm tra màn hình để hiển thị đúng phiên bản */}
                                {isMobile ? (
                                    // Mobile: Chữ và nút hiển thị trên ảnh
                                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center w-[90%] max-w-md">
                                        <div className="bg-black/40 p-3 rounded-lg">
                                            <h2 className="text-base text-white font-bold">{slide.title}</h2>
                                            <p className="text-xs text-white my-2">{slide.subtitle}</p>
                                            <Link
                                                to={slide.buttonLink}
                                                className="inline-block px-3 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 text-xs font-semibold whitespace-nowrap"
                                                rel={slide.buttonLink === "/login" ? "nofollow" : undefined}
                                            >
                                                {slide.buttonText}
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    // Desktop: Chữ nằm bên dưới ảnh
                                    <div className="relative z-10 text-white p-4 sm:p-6 md:p-8 w-full max-w-4xl">
                                        <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-4 tracking-tight line-clamp-2">
                                            {slide.title}
                                        </h2>
                                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 line-clamp-3">
                                            {slide.subtitle}
                                        </p>
                                        <Link
                                            to={slide.buttonLink}
                                            className="inline-block px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base md:text-lg font-semibold"
                                            rel={slide.buttonLink === "/login" ? "nofollow" : undefined}
                                        >
                                            {slide.buttonText}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </main>

            {/* Features Section */}
            <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">Tại Sao Chọn BrainHub?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: <FaGraduationCap className="text-4xl text-blue-600" />, title: "Giảng Viên Hàng Đầu", desc: "Đội ngũ giảng viên giàu kinh nghiệm từ các trường đại học danh tiếng, sẵn sàng hỗ trợ sinh viên trên hành trình học tập trực tuyến với BrainHub." },
                        { icon: <FaBookOpen className="text-4xl text-blue-600" />, title: "Nội Dung Chất Lượng Cao", desc: "Các khóa học được thiết kế bài bản, liên tục cập nhật theo xu hướng giáo dục mới nhất, đáp ứng mọi nhu cầu học tập của sinh viên đại học." },
                        { icon: <FaRocket className="text-4xl text-blue-600" />, title: "Học Tập Linh Hoạt", desc: "Truy cập BrainHub từ điện thoại, máy tính bảng hoặc laptop bất kỳ lúc nào, giúp bạn học tập hiệu quả mà không bị giới hạn bởi thời gian hay địa điểm." },
                    ].map((feature, index) => (
                        <div key={index} className="p-6 bg-white shadow-md rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-blue-600 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 text-base sm:text-lg">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Statistics Section */}
            <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">BrainHub Trong Số Liệu</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="p-6" data-aos="zoom-in" data-aos-delay="0"><h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{stats.students.toLocaleString()}+</h3><p className="text-gray-600 mt-2 text-base sm:text-lg">Sinh viên sử dụng BrainHub</p></div>
                    <div className="p-6" data-aos="zoom-in" data-aos-delay="100"><h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{stats.lecturers.toLocaleString()}+</h3><p className="text-gray-600 mt-2 text-base sm:text-lg">Giảng viên tin tưởng</p></div>
                    <div className="p-6" data-aos="zoom-in" data-aos-delay="200"><h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{stats.courses.toLocaleString()}+</h3><p className="text-gray-600 mt-2 text-base sm:text-lg">Khóa học chất lượng cao</p></div>
                    <div className="p-6" data-aos="zoom-in" data-aos-delay="300"><h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{stats.satisfaction}%</h3><p className="text-gray-600 mt-2 text-base sm:text-lg">Tỷ lệ hài lòng</p></div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">Tin Tức & Bài Viết Về BrainHub</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogPosts.map((post, index) => (
                        <div key={index} className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300" data-aos="fade-up" data-aos-delay={index * 100}>
                            <img src={post.image || fallbackImage} alt={`Hình ảnh bài viết: ${post.title}`} className="w-full h-48 object-cover" loading="lazy" onError={(e) => (e.target.src = fallbackImage)} />
                            <div className="p-6">
                                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
                                <p className="text-gray-600 mb-4 text-base sm:text-lg line-clamp-3">{post.excerpt}</p>
                                <Link to={post.link} className="text-blue-600 hover:underline font-medium text-base sm:text-lg">Đọc Thêm →</Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12 sm:mb-16" data-aos="fade-up">Cảm Nhận Từ Người Dùng BrainHub</h2>
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 15 }, 1024: { slidesPerView: 3, spaceBetween: 20 } }}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation
                    className="mt-12"
                >
                    {testimonials.map((testimonial, index) => (
                        <SwiperSlide key={index}>
                            <div className="p-4 sm:p-6 bg-white shadow-md rounded-xl text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-sm mx-auto" data-aos="fade-up" data-aos-delay={index * 100}>
                                <img src={testimonial.image} alt={`Ảnh đại diện của ${testimonial.name}`} className="w-16 h-16 rounded-full mx-auto mb-4" loading="lazy" />
                                <p className="text-gray-600 italic mb-4 text-sm sm:text-base line-clamp-4">"{testimonial.quote}"</p>
                                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">{testimonial.name}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            {/* FAQ Slider Section */}
            <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-12 sm:mb-16 flex items-center justify-center gap-3" data-aos="fade-up"><FaQuestionCircle className="text-3xl sm:text-4xl" /> Câu Hỏi Thường Gặp Về BrainHub</h2>
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    breakpoints={{ 640: { slidesPerView: 2, spaceBetween: 15 }, 1024: { slidesPerView: 3, spaceBetween: 20 } }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    navigation
                    className="mt-12"
                >
                    {faqs.map((faq, index) => (
                        <SwiperSlide key={index}>
                            <div className="p-4 sm:p-6 bg-white/95 shadow-md rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-sm mx-auto h-60 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-blue-600 mb-3 flex items-center gap-2"><FaQuestionCircle className="text-blue-600" /> {faq.question}</h3>
                                    <p className="text-gray-700 text-sm sm:text-base line-clamp-4">{faq.answer}</p>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            <section className="container mx-auto my-16 sm:my-20 px-4 sm:px-6 py-12 bg-blue-600 text-white rounded-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="w-full md:w-1/2 text-center md:text-left p-6" data-aos="fade-up">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">Sẵn Sàng Trải Nghiệm BrainHub?</h2>
                        <p className="text-base sm:text-lg md:text-xl mb-6 max-w-lg mx-auto md:mx-0">Đăng nhập ngay để khám phá hệ thống LMS tiên tiến nhất cho sinh viên và giảng viên đại học. Học trực tuyến chưa bao giờ dễ dàng và hiệu quả đến thế!</p>
                        <Link to="/login" className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 text-base sm:text-lg font-semibold" data-aos="zoom-in" data-aos-delay="200" rel="nofollow">Đăng Nhập Ngay</Link>
                    </div>
                    <div className="w-full md:w-1/2 p-6" data-aos="fade-up" data-aos-delay="300">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.3652029854666!2d106.69204877480615!3d10.859802889294066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529c17978287d%3A0xec48f5a17b7d5741!2zVHLGsOG7nW5nIMSQ4bqhaSho4buNYyBOZ3V54buFbiBU4bqldCBUaMOgbmggLSBDxqEgc-G7nyBxdeG6rW4gMTI!5e0!3m2!1svi!2s!4v1743362581466!5m2!1svi!2s" width="100%" height="320" className="w-full h-64 sm:h-72 rounded-lg shadow-lg" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Bản đồ Trường Đại Học Nguyễn Tất Thành - Cơ sở Quận 12" />
                    </div>
                </div>
            </section>

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

export default Landing; 
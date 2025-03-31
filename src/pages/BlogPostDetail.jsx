// BlogPostDetail.js
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { FaBars, FaTimes, FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const BlogPostDetail = () => {
    const { slug } = useParams();
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
            slug: "5-meo-hoc-online",
            title: "5 Mẹo Sử Dụng BrainHub Hiệu Quả Để Tăng Hiệu Suất Học Tập",
            content: "BrainHub là một nền tảng học tập trực tuyến mạnh mẽ, và để tận dụng tối đa tiềm năng của nó, bạn có thể áp dụng 5 mẹo sau: 1. Quản lý thời gian hiệu quả bằng cách đặt lịch học cố định. 2. Tận dụng tài liệu giảng dạy có sẵn trên hệ thống. 3. Tham gia các diễn đàn để trao đổi với bạn học. 4. Sử dụng tính năng nhắc nhở để không bỏ lỡ bài tập. 5. Theo dõi tiến độ học tập để điều chỉnh kế hoạch phù hợp.",
            image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            date: "2025-03-20",
            category: "Học Tập",
        },
        {
            slug: "khoa-hoc-moi-2025",
            title: "Khóa Học Mới Nhất 2025 Trên BrainHub: Đột Phá Trong Giáo Dục Đại Học",
            content: "Năm 2025, BrainHub ra mắt hàng loạt khóa học mới, từ công nghệ thông tin, trí tuệ nhân tạo, đến kỹ năng mềm. Các khóa học được thiết kế bởi đội ngũ giảng viên hàng đầu, đảm bảo nội dung cập nhật và phù hợp với nhu cầu thực tế của sinh viên.",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            date: "2025-03-15",
            category: "Khóa Học",
        },
        {
            slug: "loi-ich-hoc-truc-tuyen",
            title: "Lợi Ích Của BrainHub Trong Giáo Dục Đại Học: Tại Sao Bạn Nên Thử?",
            content: "BrainHub mang lại nhiều lợi ích cho giáo dục đại học, bao gồm: 1. Linh hoạt về thời gian và địa điểm học. 2. Tương tác trực tuyến hiệu quả giữa giảng viên và sinh viên. 3. Quản lý tiến độ học tập dễ dàng. 4. Tiết kiệm chi phí so với học truyền thống.",
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80",
            date: "2025-03-10",
            category: "Giáo Dục",
        },
    ];

    const post = blogPosts.find((p) => p.slug === slug);
    const fallbackImage = "https://via.placeholder.com/1350x600?text=Image+Not+Found";

    if (!post) {
        return <div className="text-center py-20">Bài viết không tồn tại.</div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-gray-200">
            {/* SEO Optimization */}
            <Helmet>
                <title>{post.title} - Blog BrainHub</title>
                <meta name="description" content={post.content.substring(0, 160)} />
                <meta name="keywords" content={`BrainHub blog, ${post.category}, ${post.title}`} />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="BrainHub Team" />
                <link rel="canonical" href={`https://lmsclient-nine.vercel.app/blog/${post.slug}`} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.content.substring(0, 160)} />
                <meta property="og:image" content={post.image} />
                <meta property="og:url" content={`https://lmsclient-nine.vercel.app/blog/${post.slug}`} />
                <meta property="og:type" content="article" />
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

            {/* Blog Post Detail */}
            <main className="pt-20">
                <section className="container mx-auto py-16 sm:py-20 px-4 sm:px-6">
                    <div className="bg-white shadow-md rounded-xl p-6 sm:p-8">
                        <img src={post.image || fallbackImage} alt={post.title} className="w-full h-64 sm:h-96 object-cover rounded-lg mb-6" loading="lazy" />
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">{post.date}</span>
                            <span className="text-sm text-blue-600 font-semibold">{post.category}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{post.content}</p>
                        <Link to="/blog" className="inline-block mt-6 text-blue-600 hover:underline font-medium text-base sm:text-lg">← Quay lại Blog</Link>
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

export default BlogPostDetail;
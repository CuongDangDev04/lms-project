import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../../services/authServices';
import logo from '../../assets/admin/logo_xoaphong.png';
import { toast } from 'react-toastify';

export const Header = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Đăng xuất thành công!')
            navigate('/dashboard');
        } catch (error) {
            console.error('Đăng xuất thất bại:', error);
        }
    };

    return (
        <nav className="bg-gradient-to-r from-blue-50 to-blue-200 text-white px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
            {/* Phần bên trái: Nút Hamburger và Logo */}
            <div className="flex items-center space-x-4">
                <button
                    className="md:hidden p-2 focus:outline-none"
                    onClick={toggleSidebar}
                    aria-label="Toggle mobile sidebar"
                >
                    <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div className="md:flex items-center absolute left-1/2 transform -translate-x-1/2 md:static md:left-0 md:transform-none">
                    <Link to="/admin">
                        <img src={logo} alt="easyLearn Logo" className="h-12 w-auto" />
                    </Link>
                </div>
            </div>

            {/* Phần bên phải: Chỉ có Logout */}
            <div className="flex items-center space-x-4">
                <button
                    className="p-2 text-blue-800 hover:text-blue-600 focus:outline-none"
                    onClick={handleLogout}
                    aria-label="Logout"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </nav>
    );
};
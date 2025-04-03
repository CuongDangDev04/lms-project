import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

export const SideBar = ({ isMobileSidebarOpen, toggleMobileSidebar, isDesktopCollapsed, toggleDesktopSidebar }) => {
    const sidebarContent = (
        <nav className={`flex-1 bg-gradient-to-b from-blue-50 to-white text-gray-800 pt-4 ${isDesktopCollapsed ? 'text-center' : ''}`}>
            <ul className="mt-20 space-y-2 px-2 py-2">
                {[
                    { title: "Dashboard", path: "/eduAffair", icon: "M3 12l9-9 9 9v10a2 2 0 01-2 2H5a2 2 0 01-2-2V12z" },
                    { title: "Khóa học", path: "/eduAffair/manager-courses", icon: "M3 6h18v12H3V6zm9 0v12" },
                    { title: "Quản lý lớp", path: "/eduAffair/manager-classes", icon: "M5 5h14v4H5V5zm0 6h14v4H5v-4zm0 6h14v4H5v-4z" },
                    { title: "Giảng Dạy", path: "/eduAffair/manager-assign", icon: "M12 4v6m-6 4h12m-9 4h6" },
                ].map((item, index) => (
                    <li key={index}>
                        <Link
                            to={item.path}
                            className={`flex items-center px-5 py-4 text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all duration-300 group hover:shadow-md hover:scale-105 ${isDesktopCollapsed ? 'justify-center' : ''
                                }`}
                        >
                            <svg
                                className={`w-6 h-6 ${isDesktopCollapsed ? 'mr-0' : 'mr-2'} text-gray-500 group-hover:text-blue-600 transition-colors`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                            </svg>
                            {!isDesktopCollapsed && <span className="font-semibold text-lg">{item.title}</span>}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );

    return (
        <>
            {/* Sidebar mobile */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-64 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </div>

            {/* Overlay khi mở sidebar mobile */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden"
                    onClick={toggleMobileSidebar}
                ></div>
            )}

            {/* Sidebar desktop */}
            <div
                className={`fixed top-0 left-0 h-full hidden md:flex md:flex-col shadow-lg transition-all duration-300 bg-white ${isDesktopCollapsed ? 'w-20' : 'w-[250px]'
                    }`}
            >

                {sidebarContent}
                <button
                    className="hidden md:block p-2 text-gray-600 hover:text-blue-600 self-end mb-4 mr-4"
                    onClick={toggleDesktopSidebar}
                    aria-label="Toggle desktop sidebar"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isDesktopCollapsed ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        )}
                    </svg>
                </button>
            </div>
        </>
    );
};
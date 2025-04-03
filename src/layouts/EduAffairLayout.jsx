import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/admin/Header";
import { SideBar } from "../components/eduAffairs/Sidebar";
import LoadingBar from "../components/users/LoadingBar";
import { ToastContainer } from "react-toastify";
const EduAffairLayout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    const toggleMobileSidebar = useCallback(() => {
        setIsMobileSidebarOpen(prev => !prev);
    }, []);

    const toggleDesktopSidebar = useCallback(() => {
        setIsDesktopCollapsed(prev => !prev);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header cố định trên cùng */}


            <Header toggleSidebar={toggleMobileSidebar} />
            <LoadingBar />
            <div className="flex flex-1">
                {/* Sidebar - cố định trên desktop, trượt vào trên mobile */}
                <SideBar
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    toggleMobileSidebar={toggleMobileSidebar}
                    isDesktopCollapsed={isDesktopCollapsed}
                    toggleDesktopSidebar={toggleDesktopSidebar}
                />

                <main
                    className={`
                        flex-1 transition-all duration-300
                        ${isDesktopCollapsed ? "md:ml-20" : "md:ml-[235px]"}
                        ${isMobileSidebarOpen ? "ml-0" : ""}
                    `}
                    style={{ paddingTop: "70px" }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EduAffairLayout;

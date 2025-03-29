import { useState, useEffect } from "react";
import SidebarCourseDetail_left from "../../components/users/SidebarCourseDetail_left";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

export default function CourseDetail() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  // Đồng bộ trạng thái với kích thước màn hình
  useEffect(() => {
    document.title = "Chi tiết khóa học - BrainHub";
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 768;
      setIsCollapsed(shouldCollapse);
      setIsSidebarOpen(!shouldCollapse); // Mở sidebar trên màn hình lớn
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex mt-6  min-h-screen relative">
      {/* Nút toggle sidebar trên mobile */}
      <button
        className="md:hidden fixed z-50 top-4 left-4 p-2 rounded-full bg-white hover:bg-gray-200 transition-colors"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:top-16 md:z-10`}
      >
        <SidebarCourseDetail_left
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Overlay khi sidebar mở trên mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Nội dung chính */}
      <div
        className={`flex-1 bg-gray-100 overflow-y-auto min-w-0 transition-all duration-300 md:pt-16 ${isCollapsed ? "md:ml-[5rem]" : "md:ml-[16rem]"
          }`}
      >
        <Outlet />
      </div>
    </div>
  );
}
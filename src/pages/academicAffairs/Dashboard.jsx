import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchCourseList, exportDashboardStats } from '../../services/dashboardAdminService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Dashboard = () => {
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalLecturers: 0,
        totalStudents: 0,
        courseRegistrationStats: [],
        classroomStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Dashboard Quản Trị LMS - BrainHub';
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await fetchCourseList();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleExport = async () => {
        try {
            const blob = await exportDashboardStats();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'dashboard_stats_report.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Không thể xuất báo cáo. Vui lòng thử lại.');
        }
    };

    const registrationChartData = {
        labels: stats.courseRegistrationStats.map(stat => stat.course_name),
        datasets: [
            {
                label: 'Sinh viên đăng ký',
                data: stats.courseRegistrationStats.map(stat => stat.registered_students),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
            },
        ],
    };

    const registrationChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: window.innerWidth < 640 ? 12 : 14, family: 'Inter' } } },
            title: {
                display: true,
                text: 'Thống Kê Đăng Ký Theo Khóa Học',
                font: { size: window.innerWidth < 640 ? 16 : 20, family: 'Inter', weight: 'bold' },
                padding: window.innerWidth < 640 ? 10 : 20
            },
            tooltip: { backgroundColor: '#1f2937', bodyFont: { size: 12 } },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, title: { display: true, text: 'Số lượng sinh viên' } },
            x: { grid: { display: false } }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' },
    };

    const classroomChartData = {
        labels: stats.classroomStats.map(stat => stat.course_name),
        datasets: [
            {
                label: 'Số lớp học',
                data: stats.classroomStats.map(stat => stat.classroom_count),
                backgroundColor: 'rgba(75, 192, 192, 0.7)', // Màu xanh ngọc để phân biệt
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(75, 192, 192, 0.9)',
            },
        ],
    };

    const classroomChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { size: window.innerWidth < 640 ? 12 : 14, family: 'Inter' } } },
            title: {
                display: true,
                text: 'Top 5 Khóa Học Có Nhiều Lớp Nhất',
                font: { size: window.innerWidth < 640 ? 16 : 20, family: 'Inter', weight: 'bold' },
                padding: window.innerWidth < 640 ? 10 : 20
            },
            tooltip: { backgroundColor: '#1f2937', bodyFont: { size: 12 } },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' }, title: { display: true, text: 'Số lượng lớp học' } },
            x: { grid: { display: false } }
        },
        animation: { duration: 1200, easing: 'easeOutQuart' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-8 px-6 sm:p-8 font-sans">
            <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard Quản Trị LMS
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-gray-600">BrainHub - Learning management system</p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 mt-4 sm:mt-0">
                    <div className="text-xs sm:text-sm text-gray-500">
                        Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                    </div>
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        Xuất Báo Cáo
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {loading ? (
                    <div className="col-span-full text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    [
                        { title: 'Tổng Môn Học', value: stats.totalCourses, change: '+8', color: 'blue', icon: 'M12 4v16m8-8H4' },
                        { title: 'Số Giảng Viên', value: stats.totalLecturers, change: '+3', color: 'green', icon: 'M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-6 10h12v8H6v-8zm2 2h8v2H8v-2z' },
                        { title: 'Số Sinh Viên', value: stats.totalStudents.toLocaleString(), change: '+9%', color: 'purple', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z' },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className={`group bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-l-4 border-${stat.color}-600`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                    <p className={`text-xl sm:text-3xl font-bold text-${stat.color}-700 mt-1 sm:mt-2`}>{stat.value}</p>
                                    <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
                                        {stat.change} so với kỳ trước
                                    </p>
                                </div>
                                <svg
                                    className={`w-8 h-8 sm:w-10 sm:h-10 text-${stat.color}-600 group-hover:scale-110 transition-transform`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg h-80 sm:h-96">
                    <Bar data={registrationChartData} options={registrationChartOptions} />
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg h-80 sm:h-96">
                    <Bar data={classroomChartData} options={classroomChartOptions} />
                </div>
            </div>
        </div>
    );




};
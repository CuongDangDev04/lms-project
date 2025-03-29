// src/pages/AssignmentAndTeaching.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AssignmentManager = () => {
    const navigate = useNavigate();

    const stats = [
        {
          title: 'Quản lý lớp học phần và phân công giảng dạy',
          color: 'green',
          icon: 'M12 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-6 10h12v8H6v-8zm2 2h8v2H8v-2z',
          link: 'unassigned-classrooms',
        },
        {
          title: 'Danh sách lớp học phần đã phân công',
          color: 'purple',
          icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z',
          link: 'assigned-classrooms',
        },
        
        {
          title: 'Tạo bài thi',
          color: 'orange',
          icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z', // Biểu tượng dấu cộng (tạo mới)
          link: 'create-exam',
        },
        {
            title: 'Kết quả bài thi',
            color: 'blue',
            icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-12h2v8h-2V5z',
            link: 'exam-results',
          },
      ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-20 px-6 sm:p-8 font-sans">
            {/* Header */}
            <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10">
                <div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Phân công và Giảng Dạy
                    </h1>
                    <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-gray-600">BrainHub - Learning management system</p>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(stat.link)}
                        className={`group bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-l-4 border-${stat.color}-600 cursor-pointer`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
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
                ))}
            </div>
        </div>
    );
};
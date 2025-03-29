import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getClassGrades } from "../../services/gradeService";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from "chart.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { fetchTeacherInformation, getCourseById } from "../../services/courseServices";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const GradeManagement = () => {
    const { classroomId } = useParams();
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classroomName, setClassroomName] = useState("");
    const [courseName, setCourseName] = useState("");
    const barChartRef = useRef(null);
    const lineChartRef = useRef(null);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                setLoading(true);
                const classInfo = await fetchTeacherInformation(classroomId);
                const courseInfo = await getCourseById(classInfo.course_id);
                setClassroomName(classInfo.Class.class_name);
                setCourseName(courseInfo.course_name);
                const data = await getClassGrades(classroomId);
                setStudents(data.students);
                setAssignments(data.assignments);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách điểm:", error);
                setStudents([]);
                setAssignments([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, [classroomId]);

    const calculateGradeDistribution = () => {
        const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        students.forEach((student) => {
            const scores = Object.values(student.grades).map((grade) => grade.score);
            const averageScore = scores.length
                ? scores.reduce((sum, score) => sum + parseFloat(score), 0) / scores.length
                : 0;
            if (averageScore >= 8.5) distribution.A++;
            else if (averageScore >= 7) distribution.B++;
            else if (averageScore >= 5.5) distribution.C++;
            else if (averageScore >= 4) distribution.D++;
            else distribution.F++;
        });
        return distribution;
    };

    const gradeDistribution = calculateGradeDistribution();
    const averageScores = students.map(student => {
        const scores = Object.values(student.grades).map(grade => grade.score);
        return scores.length ? (scores.reduce((sum, score) => sum + parseFloat(score), 0) / scores.length).toFixed(1) : 0;
    });

    const barChartData = {
        labels: ["A (8.5-10)", "B (7-8.4)", "C (5.5-6.9)", "D (4-5.4)", "F (<4)"],
        datasets: [{
            label: "Số lượng sinh viên",
            data: Object.values(gradeDistribution),
            backgroundColor: ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"],
            borderColor: "#fff",
            borderWidth: 1,
        }],
    };

    const lineChartData = {
        labels: students.map(student => student.fullname),
        datasets: [{
            label: "Điểm trung bình",
            data: averageScores,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.5)",
            fill: true,
        }],
    };

    const normalizeText = (text) => {
        return text.replace(/[^a-zA-Z0-9]/g, "_");
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();

        // Sheet 1: Bảng điểm
        const worksheet = workbook.addWorksheet("Bảng điểm");

        // Thêm tiêu đề
        worksheet.mergeCells("A1", `${String.fromCharCode(67 + assignments.length)}1`);
        worksheet.getCell("A1").value = `BẢNG ĐIỂM LỚP ${classroomName}`;
        worksheet.getCell("A1").style = {
            font: { bold: true, size: 18, color: { argb: "000000" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } }, // Màu vàng
            alignment: { horizontal: "center", vertical: "middle" },
        };

        worksheet.mergeCells("A2", `${String.fromCharCode(67 + assignments.length)}2`);
        worksheet.getCell("A2").value = `Khóa học: ${courseName}`;
        worksheet.getCell("A2").style = {
            font: { size: 14, color: { argb: "000000" } },
            alignment: { horizontal: "center", vertical: "middle" },
        };

        // Thêm header
        const headerRow = worksheet.addRow(["MSSV", "Tên", "Email", ...assignments.map(a => a.title), "ĐIỂM TB"]);
        headerRow.eachCell((cell, colNumber) => {
            cell.style = {
                font: { bold: true, size: 12, color: { argb: "FFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } }, // Màu xanh dương
                border: {
                    top: { style: "medium", color: { argb: "000000" } },
                    bottom: { style: "medium", color: { argb: "000000" } },
                    left: { style: "thin", color: { argb: "000000" } },
                    right: { style: "thin", color: { argb: "000000" } },
                },
                alignment: { horizontal: "center", vertical: "middle", wrapText: true },
            };
            // Tô màu đặc biệt cho cột "ĐIỂM TB"
            if (colNumber === 4 + assignments.length) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3333" } }; // Màu đỏ đậm hơn
            }
        });

        // Thêm dữ liệu
        students.forEach((student, index) => {
            const row = worksheet.addRow([
                student.username,
                student.fullname,
                student.email,
                ...assignments.map(a => student.grades[a.assignment_id]?.score || "Chưa chấm"),
                averageScores[index]
            ]);
            row.eachCell((cell, colNumber) => {
                cell.style = {
                    font: { size: 12 },
                    border: {
                        top: { style: "thin", color: { argb: "000000" } },
                        bottom: { style: "thin", color: { argb: "000000" } },
                        left: { style: "thin", color: { argb: "000000" } },
                        right: { style: "thin", color: { argb: "000000" } },
                    },
                    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
                    fill: index % 2 === 0 ? { type: "pattern", pattern: "solid", fgColor: { argb: "E6F0FA" } } : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } }, // Xen kẽ màu xanh nhạt và trắng
                };
                // Tô màu cho cột "ĐIỂM TB"
                if (colNumber === 4 + assignments.length) {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6666" } }; // Màu đỏ nhạt đậm hơn
                    cell.font = { bold: true, color: { argb: "CC0000" } }; // Chữ màu đỏ đậm
                }
            });
        });

        // Đặt độ rộng cột
        worksheet.columns = [
            { width: 15 }, // MSSV
            { width: 25 }, // Tên
            { width: 30 }, // Email
            ...assignments.map(() => ({ width: 15 })), // Các cột điểm
            { width: 12 }  // ĐIỂM TB
        ];

        // Đặt chiều cao hàng
        worksheet.getRow(1).height = 40; // Tiêu đề chính
        worksheet.getRow(2).height = 30; // Dòng phụ
        worksheet.getRow(3).height = 10; // Dòng trống
        worksheet.getRow(4).height = 35; // Header
        for (let i = 5; i <= students.length + 4; i++) {
            worksheet.getRow(i).height = 25; // Dữ liệu
        }

        // Thêm viền ngoài cho toàn bộ bảng
        const startRow = 4;
        const endRow = students.length + 4;
        const startCol = 1; // Cột A
        const endCol = 4 + assignments.length; // Cột cuối (ĐIỂM TB)

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = worksheet.getCell(row, col);
                cell.border = {
                    top: row === startRow ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                    bottom: row === endRow ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                    left: col === startCol ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                    right: col === endCol ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                };
            }
        }

        // Sheet 2: Thống kê điểm
        const chartSheet = workbook.addWorksheet("Thống kê điểm");

        // Thêm tiêu đề cho sheet thống kê
        chartSheet.mergeCells("A1:B1");
        chartSheet.getCell("A1").value = "THỐNG KÊ PHÂN LOẠI ĐIỂM";
        chartSheet.getCell("A1").style = {
            font: { bold: true, size: 16, color: { argb: "000000" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } },
            alignment: { horizontal: "center", vertical: "middle" },
        };
        chartSheet.getRow(1).height = 40;

        // Thêm dữ liệu cho biểu đồ
        chartSheet.addRow(["Phân loại điểm", "Số lượng sinh viên"]);
        chartSheet.addRow(["A (8.5-10)", gradeDistribution.A]);
        chartSheet.addRow(["B (7-8.4)", gradeDistribution.B]);
        chartSheet.addRow(["C (5.5-6.9)", gradeDistribution.C]);
        chartSheet.addRow(["D (4-5.4)", gradeDistribution.D]);
        chartSheet.addRow(["F (<4)", gradeDistribution.F]);

        // Định dạng dữ liệu biểu đồ
        chartSheet.getRow(2).eachCell(cell => {
            cell.style = {
                font: { bold: true, size: 12, color: { argb: "FFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } },
                border: {
                    top: { style: "medium", color: { argb: "000000" } },
                    bottom: { style: "medium", color: { argb: "000000" } },
                    left: { style: "thin", color: { argb: "000000" } },
                    right: { style: "thin", color: { argb: "000000" } },
                },
                alignment: { horizontal: "center", vertical: "middle" },
            };
        });

        for (let row = 3; row <= 7; row++) {
            chartSheet.getRow(row).eachCell((cell, colNumber) => {
                cell.style = {
                    font: { size: 12 },
                    border: {
                        top: { style: "thin", color: { argb: "000000" } },
                        bottom: { style: "thin", color: { argb: "000000" } },
                        left: { style: "thin", color: { argb: "000000" } },
                        right: { style: "thin", color: { argb: "000000" } },
                    },
                    alignment: { horizontal: "center", vertical: "middle" },
                    fill: (row - 3) % 2 === 0 ? { type: "pattern", pattern: "solid", fgColor: { argb: "E6F0FA" } } : { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } },
                };
                if (colNumber === 2) {
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6666" } };
                    cell.font = { bold: true, color: { argb: "CC0000" } };
                }
            });
        }

        chartSheet.columns = [{ width: 15 }, { width: 20 }];

        // Thêm viền ngoài cho bảng thống kê
        for (let row = 2; row <= 7; row++) {
            for (let col = 1; col <= 2; col++) {
                const cell = chartSheet.getCell(row, col);
                cell.border = {
                    top: row === 2 ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                    bottom: row === 7 ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                    left: col === 1 ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                    right: col === 2 ? { style: "medium", color: { argb: "000000" } } : { style: "thin", color: { argb: "000000" } },
                };
            }
        }

        // Thêm hình ảnh biểu đồ
        const barChartImage = barChartRef.current?.toBase64Image();
        if (barChartImage) {
            const imageId = workbook.addImage({
                base64: barChartImage,
                extension: "png",
            });
            chartSheet.addImage(imageId, {
                tl: { col: 0, row: 8 },
                ext: { width: 500, height: 250 },
            });
        }

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `Grades_${normalizeText(classroomName)}_${classroomId}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-600">
                    Quản lý điểm số
                </h1>
                <h2 className="text-lg md:text-xl text-center font-semibold mb-4 text-gray-800">
                    Lớp: {classroomName} - {courseName}
                </h2>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
                    <button
                        onClick={exportToExcel}
                        className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                    >
                        Xuất Excel
                    </button>
                </div>

                <div className="overflow-x-auto rounded-lg">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Đang tải...</div>
                    ) : (
                        <table className="w-full border-collapse text-sm md:text-base">
                            <thead>
                                <tr className="bg-blue-500 text-white">
                                    <th className="p-2 md:p-4 border-b">MSSV</th>
                                    <th className="p-2 md:p-4 border-b">Tên</th>
                                    <th className="p-2 md:p-4 border-b">Email</th>
                                    {assignments.map(a => (
                                        <th key={a.assignment_id} className="p-2 md:p-4 border-b">{a.title}</th>
                                    ))}
                                    <th className="p-2 md:p-4 border-b">Điểm TB</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.user_id} className="hover:bg-blue-50 text-center">
                                        <td className="border p-2 md:p-3">{student.username}</td>
                                        <td className="border p-2 md:p-3">{student.fullname}</td>
                                        <td className="border p-2 md:p-3">{student.email}</td>
                                        {assignments.map(a => (
                                            <td key={a.assignment_id} className="border p-2 md:p-3">
                                                {student.grades[a.assignment_id]?.score || "0"}
                                            </td>
                                        ))}
                                        <td className="border p-2 md:p-3 font-semibold">{averageScores[index]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <Bar
                            ref={barChartRef}
                            data={barChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { title: { display: true, text: "Phân Loại Điểm" } }
                            }}
                            height={300}
                        />
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <Line
                            ref={lineChartRef}
                            data={lineChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { title: { display: true, text: "Điểm Trung Bình Sinh Viên" } }
                            }}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

};

export default GradeManagement;
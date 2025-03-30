import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getClassGrades } from "../../services/gradeService";
import { Bar, Line, Pie, Doughnut, Scatter, Radar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, ScatterController, RadialLinearScale } from "chart.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { fetchTeacherInformation, getCourseById } from "../../services/courseServices";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, ScatterController, RadialLinearScale);

const GradeManagement = () => {
    const { classroomId } = useParams();
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classroomName, setClassroomName] = useState("");
    const [courseName, setCourseName] = useState("");
    const barChartRef = useRef(null);
    const lineChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const doughnutChartRef = useRef(null);
    const scatterChartRef = useRef(null);
    const radarChartRef = useRef(null);
    const top5BarChartRef = useRef(null);
    const passPieChartRef = useRef(null);
    const examBarChartRef = useRef(null);

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
                setExams(data.exams);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách điểm:", error);
                setStudents([]);
                setAssignments([]);
                setExams([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, [classroomId]);

    // Phân loại điểm tổng
    const calculateGradeDistribution = () => {
        const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        students.forEach((student) => {
            const finalAverage = student.final_average;
            if (finalAverage >= 8.5) distribution.A++;
            else if (finalAverage >= 7) distribution.B++;
            else if (finalAverage >= 5.5) distribution.C++;
            else if (finalAverage >= 4.5) distribution.D++;
            else distribution.F++;
        });
        return distribution;
    };

    // Tỷ lệ hoàn thành bài thi
    const calculateExamCompletion = () => {
        const completion = { completed: 0, pending: 0 };
        students.forEach(student => {
            Object.values(student.exam_grades).forEach(grade => {
                if (grade.status === "Đã làm") completion.completed++;
                else completion.pending++;
            });
        });
        return completion;
    };

    // Tỷ lệ hoàn thành bài tập
    const calculateAssignmentCompletion = () => {
        const completion = { completed: 0, pending: 0 };
        students.forEach(student => {
            assignments.forEach(assignment => {
                const score = student.assignment_grades[assignment.assignment_id]?.score;
                if (score !== null && score !== undefined) completion.completed++;
                else completion.pending++;
            });
        });
        return completion;
    };

    // Tỷ lệ pass (trên 4.5)
    const calculatePassRate = () => {
        const pass = students.filter(s => s.final_average >= 4.5).length;
        const fail = students.length - pass;
        return { pass, fail };
    };

    // Top 5 sinh viên có điểm cao nhất
    const getTop5Students = () => {
        return [...students]
            .sort((a, b) => b.final_average - a.final_average)
            .slice(0, 5);
    };

    // Điểm trung bình từng bài thi
    const calculateExamAverages = () => {
        return exams.map(exam => {
            const scores = students.map(student => student.exam_grades[exam.exam_id]?.score || 0);
            return scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });
    };

    const gradeDistribution = calculateGradeDistribution();
    const examCompletion = calculateExamCompletion();
    const assignmentCompletion = calculateAssignmentCompletion();
    const passRate = calculatePassRate();
    const top5Students = getTop5Students();
    const examAverages = calculateExamAverages();

    // Dữ liệu biểu đồ
    const barChartData = {
        labels: ["A (8.5-10)", "B (7-8.4)", "C (5.5-6.9)", "D (4.5-5.4)", "F (<4.5)"],
        datasets: [{
            label: "Số lượng sinh viên",
            data: Object.values(gradeDistribution),
            backgroundColor: ["#4ADE80", "#22C55E", "#16A34A", "#15803D", "#166534"],
            borderColor: "#fff",
            borderWidth: 1,
        }],
    };

    const lineChartData = {
        labels: students.map(student => student.fullname),
        datasets: [
            { label: "TB Thường kỳ", data: students.map(s => s.assignment_average), borderColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.3)", fill: true },
            { label: "TB Thi", data: students.map(s => s.exam_average), borderColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.3)", fill: true },
            { label: "Tổng Điểm", data: students.map(s => s.final_average), borderColor: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.3)", fill: true },
        ],
    };

    const pieChartData = {
        labels: ["Đã hoàn thành", "Chưa hoàn thành"],
        datasets: [{
            data: [examCompletion.completed, examCompletion.pending],
            backgroundColor: ["#4ADE80", "#EF4444"],
            borderColor: "#fff",
            borderWidth: 2,
        }],
    };

    const doughnutChartData = {
        labels: ["Đã nộp", "Chưa nộp"],
        datasets: [{
            data: [assignmentCompletion.completed, assignmentCompletion.pending],
            backgroundColor: ["#3B82F6", "#F59E0B"],
            borderColor: "#fff",
            borderWidth: 2,
        }],
    };

    const scatterChartData = {
        datasets: [{
            label: "TB Thường kỳ vs TB Thi",
            data: students.map(student => ({
                x: student.assignment_average,
                y: student.exam_average,
            })),
            backgroundColor: "#8B5CF6",
            borderColor: "#fff",
            pointRadius: 6,
        }],
    };

    const radarChartData = {
        labels: ["TB Thường kỳ", "TB Thi", "Tổng Điểm"],
        datasets: top5Students.map(student => ({
            label: student.fullname,
            data: [student.assignment_average, student.exam_average, student.final_average],
            backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
            borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
            borderWidth: 2,
        })),
    };

    const top5BarChartData = {
        labels: top5Students.map(student => student.fullname),
        datasets: [{
            label: "Tổng Điểm",
            data: top5Students.map(student => student.final_average),
            backgroundColor: "#8B5CF6",
            borderColor: "#fff",
            borderWidth: 1,
        }],
    };

    const passPieChartData = {
        labels: ["Pass (>=4.5)", "Fail (<4.5)"],
        datasets: [{
            data: [passRate.pass, passRate.fail],
            backgroundColor: ["#4ADE80", "#EF4444"],
            borderColor: "#fff",
            borderWidth: 2,
        }],
    };

    const examBarChartData = {
        labels: exams.map(exam => exam.title),
        datasets: [{
            label: "Điểm TB",
            data: examAverages,
            backgroundColor: "#3B82F6",
            borderColor: "#fff",
            borderWidth: 1,
        }],
    };

    const normalizeText = (text) => text.replace(/[^a-zA-Z0-9]/g, "_");

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Hệ thống Quản lý Điểm";
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet("Bảng điểm", { properties: { tabColor: { argb: "4ADE80" } } });
        worksheet.mergeCells(`A1:${String.fromCharCode(65 + assignments.length + exams.length + 5)}1`);
        worksheet.getCell("A1").value = `BẢNG ĐIỂM LỚP ${classroomName.toUpperCase()}`;
        worksheet.getCell("A1").style = {
            font: { bold: true, size: 20, color: { argb: "FFFFFF" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8A" } },
            alignment: { horizontal: "center", vertical: "middle" },
        };
        worksheet.mergeCells(`A2:${String.fromCharCode(65 + assignments.length + exams.length + 5)}2`);
        worksheet.getCell("A2").value = `Khóa học: ${courseName}`;
        worksheet.getCell("A2").style = {
            font: { italic: true, size: 14, color: { argb: "1E3A8A" } },
            alignment: { horizontal: "center", vertical: "middle" },
        };

        const headerRow = worksheet.addRow(["MSSV", "Họ Tên", "Email", ...assignments.map(a => a.title), ...exams.map(e => e.title), "TB Thường kỳ", "TB Thi", "Tổng Điểm"]);
        headerRow.eachCell(cell => {
            cell.style = {
                font: { bold: true, size: 12, color: { argb: "FFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } },
                border: { top: { style: "medium" }, bottom: { style: "medium" }, left: { style: "thin" }, right: { style: "thin" } },
                alignment: { horizontal: "center", vertical: "middle", wrapText: true },
            };
        });

        students.forEach(student => {
            const row = worksheet.addRow([
                student.username,
                student.fullname,
                student.email,
                ...assignments.map(a => student.assignment_grades[a.assignment_id]?.score ?? "Chưa nộp"),
                ...exams.map(e => student.exam_grades[e.exam_id]?.score ?? 0),
                student.assignment_average,
                student.exam_average,
                student.final_average
            ]);
            row.eachCell(cell => {
                cell.style = {
                    font: { size: 11 },
                    border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } },
                    alignment: { horizontal: "center", vertical: "middle" },
                };
            });
        });

        worksheet.columns = [
            { width: 15 }, { width: 25 }, { width: 30 },
            ...assignments.map(() => ({ width: 15 })),
            ...exams.map(() => ({ width: 15 })),
            { width: 15 }, { width: 15 }, { width: 15 }
        ];
        worksheet.getRow(1).height = 50;
        worksheet.getRow(2).height = 30;
        worksheet.getRow(3).height = 40;

        const statsSheet = workbook.addWorksheet("Thống kê", { properties: { tabColor: { argb: "EF4444" } } });
        statsSheet.mergeCells("A1:H1");
        statsSheet.getCell("A1").value = "THỐNG KÊ ĐIỂM SỐ";
        statsSheet.getCell("A1").style = {
            font: { bold: true, size: 16, color: { argb: "FFFFFF" } },
            fill: { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8A" } },
            alignment: { horizontal: "center", vertical: "middle" },
        };

        statsSheet.addRow(["Phân loại điểm", "Số lượng", "Tỷ lệ bài thi", "Số lượng", "Tỷ lệ bài tập", "Số lượng", "Tỷ lệ Pass", "Số lượng"]);
        statsSheet.addRow(["A (8.5-10)", gradeDistribution.A, "Đã hoàn thành", examCompletion.completed, "Đã nộp", assignmentCompletion.completed, "Pass (>=4.5)", passRate.pass]);
        statsSheet.addRow(["B (7-8.4)", gradeDistribution.B, "Chưa hoàn thành", examCompletion.pending, "Chưa nộp", assignmentCompletion.pending, "Fail (<4.5)", passRate.fail]);
        statsSheet.addRow(["C (5.5-6.9)", gradeDistribution.C, "", "", "", "", "", ""]);
        statsSheet.addRow(["D (4.5-5.4)", gradeDistribution.D, "", "", "", "", "", ""]);
        statsSheet.addRow(["F (<4.5)", gradeDistribution.F, "", "", "", "", "", ""]);

        statsSheet.getRow(2).eachCell(cell => {
            cell.style = { font: { bold: true, color: { argb: "FFFFFF" } }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } } };
        });
        for (let i = 3; i <= 7; i++) {
            statsSheet.getRow(i).eachCell(cell => {
                cell.style = { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
            });
        }
        statsSheet.columns = [{ width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }];

        const barChartImage = barChartRef.current?.toBase64Image();
        const pieChartImage = pieChartRef.current?.toBase64Image();
        const doughnutChartImage = doughnutChartRef.current?.toBase64Image();
        const top5BarChartImage = top5BarChartRef.current?.toBase64Image();
        const examBarChartImage = examBarChartRef.current?.toBase64Image();
        if (barChartImage) statsSheet.addImage(workbook.addImage({ base64: barChartImage, extension: "png" }), { tl: { col: 0, row: 8 }, ext: { width: 400, height: 200 } });
        if (pieChartImage) statsSheet.addImage(workbook.addImage({ base64: pieChartImage, extension: "png" }), { tl: { col: 5, row: 8 }, ext: { width: 400, height: 200 } });
        if (doughnutChartImage) statsSheet.addImage(workbook.addImage({ base64: doughnutChartImage, extension: "png" }), { tl: { col: 0, row: 15 }, ext: { width: 400, height: 200 } });
        if (top5BarChartImage) statsSheet.addImage(workbook.addImage({ base64: top5BarChartImage, extension: "png" }), { tl: { col: 5, row: 15 }, ext: { width: 400, height: 200 } });
        if (examBarChartImage) statsSheet.addImage(workbook.addImage({ base64: examBarChartImage, extension: "png" }), { tl: { col: 0, row: 22 }, ext: { width: 400, height: 200 } });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Bang_Diem_${normalizeText(classroomName)}_${courseName}.xlsx`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Quản Lý Điểm Số
                </h1>
                <h2 className="text-lg sm:text-xl text-center font-medium text-gray-700 mb-6">
                    Lớp: {classroomName} - {courseName}
                </h2>

                <div className="flex flex-col sm:flex-row justify-end gap-4 mb-6">
                    <button
                        onClick={exportToExcel}
                        className="w-full sm:w-auto bg-gradient-to-r from-teal-400 to-teal-600 text-white px-6 py-2 rounded-full shadow-lg hover:from-teal-500 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Xuất Excel
                    </button>
                </div>

                {/* Bảng điểm với scroll bar */}
                <div className="bg-white rounded-xl shadow-md mb-8 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
                    ) : (
                        <table className="w-full text-xs sm:text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                    <th className="p-3 sm:p-4 rounded-tl-xl">MSSV</th>
                                    <th className="p-3 sm:p-4">Họ Tên</th>
                                    <th className="p-3 sm:p-4">Email</th>
                                    <th className="p-3 sm:p-4">TB Thường kỳ</th>
                                    <th className="p-3 sm:p-4">TB Thi</th>
                                    <th className="p-3 sm:p-4 rounded-tr-xl">Tổng Điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.user_id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-blue-100 transition-colors`}>
                                        <td className="p-3 sm:p-4 border-t text-gray-700">{student.username}</td>
                                        <td className="p-3 sm:p-4 border-t text-gray-700">{student.fullname}</td>
                                        <td className="p-3 sm:p-4 border-t text-gray-700">{student.email}</td>
                                        <td className="p-3 sm:p-4 border-t text-center font-semibold text-blue-700">{student.assignment_average}</td>
                                        <td className="p-3 sm:p-4 border-t text-center font-semibold text-blue-700">{student.exam_average}</td>
                                        <td className="p-3 sm:p-4 border-t text-center font-semibold text-blue-700">{student.final_average}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Bar
                            ref={barChartRef}
                            data={barChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "Phân Loại Điểm Tổng", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Pie
                            ref={pieChartRef}
                            data={pieChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "Tỷ Lệ Hoàn Thành Bài Thi", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Doughnut
                            ref={doughnutChartRef}
                            data={doughnutChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "Tỷ Lệ Nộp Bài Tập", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Scatter
                            ref={scatterChartRef}
                            data={scatterChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "TB Thường kỳ vs TB Thi", font: { size: 16 } } },
                                scales: {
                                    x: { title: { display: true, text: "TB Thường kỳ" } },
                                    y: { title: { display: true, text: "TB Thi" } },
                                },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Radar
                            ref={radarChartRef}
                            data={radarChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "So Sánh Điểm Top 5 SV", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Bar
                            ref={top5BarChartRef}
                            data={top5BarChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "Top 5 SV Cao Điểm Nhất", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Pie
                            ref={passPieChartRef}
                            data={passPieChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "Tỷ Lệ Pass/Fail", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
                        <Bar
                            ref={examBarChartRef}
                            data={examBarChartData}
                            options={{
                                indexAxis: "y", // Horizontal Bar
                                responsive: true,
                                plugins: { title: { display: true, text: "Điểm TB Từng Bài Thi", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300 col-span-1 sm:col-span-2">
                        <Line
                            ref={lineChartRef}
                            data={lineChartData}
                            options={{
                                responsive: true,
                                plugins: { title: { display: true, text: "Biểu Đồ Điểm Sinh Viên", font: { size: 16 } } },
                            }}
                            height={200}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradeManagement;
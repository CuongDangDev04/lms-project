const { Course } = require('../../models/index');
const { validateId } = require('../../middlewares/validateID');
const XLSX = require("xlsx");
const upload = require("../../middlewares/upload");
const fs = require('fs').promises;
const getCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.status(200).json({
            success: true,
            message: "Lay khoa hoc thanh conng!",
            data: courses
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Get COurseByID
const getCourseByID = async (req, res) => {
    try {
        const course = await validateId(req.params.id, Course, 'courses');
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.status(200).json({ success: true, message: "Get Course OK!", data: course });
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const createCourse = async (req, res) => {
    try {
        const { course_code, course_name, description } = req.body;

        if (!course_name) {
            return res.status(400).json({
                success: false,
                message: "course_name là bắt buộc"
            });
        }

        // Kiểm tra trùng tên khóa học
        const existingCourse = await Course.findOne({ where: { course_name, course_code } });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: "Course đã tồn tại"
            })
        }
        // Tạo mảng các đường dẫn ảnh
        const courseImages = [
            'img1',
            'img2',
            'img3',
            'img4',
            'img5',
            'img6'
        ];

        // Tạo random index từ 1 đến 6
        const randomIndex = Math.floor(Math.random() * 6) + 1;
        const randomImage = courseImages[randomIndex - 1];

        console.log('Random Index:', randomIndex); // Debug
        console.log('Random Image:', randomImage); // Debug
        const dataNewCourse = await Course.create({
            course_code,
            course_name,
            description,
            course_img: randomImage
        })

        res.status(201).json({
            success: true,
            message: "Tạo Course thành công",
            data: dataNewCourse
        })
    } catch (error) {
        console.error("Error create course:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const createCourseByExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file Excel" });
        }

        const filePath = req.file.path; // Lưu đường dẫn file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const workSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let errors = [];
        let dataNewCourses = [];

        for (let row of workSheet) {
            const { course_code, course_name, description } = row;

            if (!course_code || !course_name) {
                errors.push(`Dòng ${workSheet.indexOf(row) + 2}: Thiếu course_code hoặc course_name`);
                continue;
            }

            const existingCourse = await Course.findOne({ where: { course_code } });

            if (existingCourse) {
                errors.push(`Dòng ${workSheet.indexOf(row) + 2}: Mã khóa học ${course_code} đã tồn tại`);
                continue;
            }

            dataNewCourses.push({
                course_code,
                course_name,
                description: description || "",
            });
        }

        // Nếu có lỗi, xóa file và trả về thông báo lỗi
        if (errors.length > 0) {
            await fs.promises.unlink(filePath); // Sử dụng fs.promises để đồng bộ
            return res.status(400).json({ message: errors.join(", ") });
        }

        // Nếu không có khóa học hợp lệ để thêm
        if (dataNewCourses.length === 0) {
            await fs.promises.unlink(filePath);
            return res.status(400).json({ message: "Không có khóa học nào hợp lệ để thêm" });
        }

        // Thêm khóa học và xóa file sau khi thành công
        await Course.bulkCreate(dataNewCourses);
        await fs.promises.unlink(filePath); // Xóa file ngay sau khi thêm thành công

        return res.status(201).json({ message: "Thêm nhiều khóa học thành công từ file Excel" });

    } catch (error) {
        // Xử lý lỗi và xóa file nếu tồn tại
        if (req.file && req.file.path) {
            await fs.promises.unlink(req.file.path).catch(err => console.error('Không thể xóa file:', err));
        }
        return res.status(500).json({ error: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        if (isNaN(courseId) || courseId <= 0) {
            return res.status(400).json({ success: false, message: " course ID khonnng hop le" });
        }

        const course = await validateId(req.params.id, Course, 'courses');
        if (!course) {
            return res.status(404).json({ success: false, message: "Khong tim thay Course" });
        }

        const { course_code, course_name, description } = req.body;
        const updates = {};

        if (course_code) updates.course_code = course_code;
        if (course_name) updates.course_name = course_name;
        if (description !== undefined) updates.description = description;
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "Không có trường nào được cung cấp để cập nhật" });
        }

        const updateCourse = await course.update(updates);
        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updateCourse
        });

    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const deleteCourseById = async (req, res) => {
    const course_id = req.params.id;
    try {
        let course = await Course.findByPk(course_id);
        if (!course) return res.status(404).json({ message: "Không tìm thấy user" });
        await Course.destroy({ where: { course_id } });
        res.status(200).json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCourses,
    getCourseByID,
    createCourse,
    updateCourse,
    deleteCourseById,
    createCourseByExcel
}
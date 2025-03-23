const { Class } = require('../../models/index');
const { validateId } = require('../../middlewares/validateID');
const XLSX = require("xlsx");

const getClasses = async (req, res) => {
    try {
        const classes = await Class.findAll();
        res.status(200).json({
            success: true,
            message: "Lay lop hoc thanh conng!",
            data: classes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getClassByID = async (req, res) => {
    try {
        const classes = await validateId(req.params.id, Class, 'classes');
        if (!classes) {
            return res.status(404).json({ success: false, message: "classes not found" });
        }

        res.status(200).json({ success: true, message: "Get Class OK!", data: classes });
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const createClass = async (req, res) => {
    try {
        const { class_name } = req.body;

        if (!class_name) {
            return res.status(400).json({
                success: false,
                message: "class_name là bắt buộc"
            });
        }

        const existingClass = await Class.findOne({ where: { class_name } });
        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: "Class đã tồn tại"
            })
        }

        const dataNewClass = await Class.create({
            class_name
        })

        res.status(201).json({
            success: true,
            message: "Tạo Class thành công",
            data: dataNewClass
        })
    } catch (error) {
        console.error("Error create course:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const createClassByExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng upload file Excel" });
        }

        // Đọc file Excel
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const workSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let errors = [];
        let dataNewClasses = [];

        for (let row of workSheet) {
            const { class_name } = row;

            if (!class_name) {
                errors.push(`Dòng ${workSheet.indexOf(row) + 2}: Thiếu class_name`);
                continue;
            }

            const existingClasses = await Class.findOne({ where: { class_name } });

            if (existingClasses) {
                errors.push(`Dòng ${workSheet.indexOf(row) + 2}: Ten lop ${class_name} đã tồn tại`);
                continue;
            }

            dataNewClasses.push({
                class_name
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(", ") });
        }

        if (dataNewClasses.length > 0) {
            await Class.bulkCreate(dataNewClasses);
            return res.status(201).json({ message: "Thêm nhiều lop học thành công từ file Excel" });
        }

        return res.status(400).json({ message: "Không có lop học nào hợp lệ để thêm" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateClass = async (req, res) => {
    try {
        const classId = parseInt(req.params.id, 10);
        if (isNaN(classId) || classId <= 0) {
            return res.status(400).json({ success: false, message: " Class ID khong hop le" });
        }

        const classes = await validateId(req.params.id, Class, 'classes');
        if (!classes) {
            return res.status(404).json({ success: false, message: "Khong tim thay Class" });
        }

        const { class_name } = req.body;
        const updates = {};

        if (class_name) updates.class_name = class_name;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "Không có trường nào được cung cấp để cập nhật" });
        }

        const updateClass = await classes.update(updates);
        res.status(200).json({
            success: true,
            message: "Class updated successfully",
            data: updateClass
        });

    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const deleteClassById = async (req, res) => {
    const class_id = req.params.id;
    try {
        let classes = await Class.findByPk(class_id);
        if (!classes) return res.status(404).json({ message: "Không tìm thấy Class" });
        await Class.destroy({ where: { class_id } });
        res.status(200).json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getClasses,
    getClassByID,
    createClass,
    updateClass,
    deleteClassById,
    createClassByExcel
}
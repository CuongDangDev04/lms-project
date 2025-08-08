const { ClassStatus } = require('../../models/index');

const createClassStatus = async (req, res) => {
    try {
        const { status_name } = req.body;

        if (!status_name) {
            return res.status(400).json({ error: 'Yêu cầu cung cấp status_name' });
        }

        const classStatus = await ClassStatus.create({ status_name });

        return res.status(201).json({
            message: 'Tạo trạng thái thành công',
            data: classStatus,
        });
    } catch (error) {
        console.error('Lỗi khi tạo trạng thái:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const getAllClassStatuses = async (req, res) => {
    try {
        const statuses = await ClassStatus.findAll();

        return res.status(200).json({
            message: 'Lấy danh sách trạng thái thành công',
            data: statuses,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách trạng thái:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const getClassStatusById = async (req, res) => {
    try {
        const { id } = req.params;

        const classStatus = await ClassStatus.findByPk(id);
        if (!classStatus) {
            return res.status(404).json({ error: 'Trạng thái không tồn tại' });
        }

        return res.status(200).json({
            message: 'Lấy thông tin trạng thái thành công',
            data: classStatus,
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin trạng thái:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};
const updateClassStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_name } = req.body;

        const classStatus = await ClassStatus.findByPk(id);
        if (!classStatus) {
            return res.status(404).json({ error: 'Trạng thái không tồn tại' });
        }

        if (!status_name) {
            return res.status(400).json({ error: 'Yêu cầu cung cấp status_name' });
        }

        await classStatus.update({ status_name });

        return res.status(200).json({
            message: 'Cập nhật trạng thái thành công',
            data: classStatus,
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

const deleteClassStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const classStatus = await ClassStatus.findByPk(id);
        if (!classStatus) {
            return res.status(404).json({ error: 'Trạng thái không tồn tại' });
        }

        const relatedClassroom = await Classroom.findOne({ where: { status_id: id } });
        if (relatedClassroom) {
            return res.status(400).json({
                error: 'Không thể xóa trạng thái vì đang được sử dụng bởi một lớp học phần',
            });
        }

        await classStatus.destroy();

        return res.status(200).json({
            message: 'Xóa trạng thái thành công',
        });
    } catch (error) {
        console.error('Lỗi khi xóa trạng thái:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = {
    getAllClassStatuses,
    getClassStatusById,
    createClassStatus,
    updateClassStatus,
    deleteClassStatus
}
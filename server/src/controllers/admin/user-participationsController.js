const { UserParticipation } = require('../../models/index');

const getUserParticipations = async (req, res) => {
    try {
        const participations = await UserParticipation.findAll();
        res.status(200).json({
            success: true,
            data: participations,
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách UserParticipations:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server nội bộ',
            error: error.message,
        });
    }
};

module.exports = {
    getUserParticipations
};
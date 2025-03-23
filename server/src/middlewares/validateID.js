
/** * Middleware để xác thực ID và lấy bản ghi từ một mô hình nhất định 
 * * @param {string|number} id - ID để xác thực * @param {Object} Model - Mô hình tiếp theo để truy vấn 
 * * @param {string} [modelName] - Tên tùy chọn của mô hình cho thông báo lỗi 
 * * @returns {Object} Phiên bản bản ghi nếu tìm thấy 
 * * @throws {Error} Nếu ID không hợp lệ hoặc không tìm thấy bản ghi 
*/

const validateId = async (id, Model, modelName = "Record") => {

    if (!Number.isInteger(Number(id))) {
        throw new Error(`ID THUỘC ${modelName.toLowerCase()} Không tồn tại`)
    }

    const record = await Model.findByPk(id);
    if (!record) {
        throw new Error(`${modelName} not found`);
    }

    return record;
}

module.exports = {
    validateId
}
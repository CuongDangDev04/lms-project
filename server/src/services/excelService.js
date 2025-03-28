const xlsx = require('xlsx');

const parseExcelFile = (file) => {
    try {
        // Kiểm tra xem file có tồn tại và có buffer không
        if (!file || !file.buffer) {
            throw new Error('File không hợp lệ hoặc không có dữ liệu');
        }

        // Đọc file Excel
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });

        // Kiểm tra xem workbook có sheet nào không
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('File Excel không có sheet nào');
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Kiểm tra xem sheet có tồn tại không
        if (!sheet) {
            throw new Error('Không thể đọc sheet từ file Excel');
        }

        const data = xlsx.utils.sheet_to_json(sheet);

        // Kiểm tra xem dữ liệu có rỗng không
        if (!data || data.length === 0) {
            throw new Error('File Excel không chứa dữ liệu');
        }

        return data;
    } catch (error) {
        throw new Error(`Lỗi khi đọc file Excel: ${error.message}`);
    }
};

module.exports = { parseExcelFile };
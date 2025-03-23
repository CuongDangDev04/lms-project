const { User } = require("../../models/index");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs');

// Hàm upload ảnh lên ImgBB và lấy URL
const uploadImageToImgBB = async (filePath) => {
  const apiKey = process.env.API_KEY_UPLOAD_IMG;
  const url = "https://api.imgbb.com/1/upload";

  if (!apiKey) {
    throw new Error("API_KEY_UPLOAD_IMG is not defined in .env");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist at path: ${filePath}`);
  }

  const formData = new FormData();
  formData.append("image", fs.createReadStream(filePath)); // Sử dụng file từ đĩa
  formData.append("key", apiKey);

  try {
    console.log("Uploading to ImgBB with file:", filePath);
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(), // Sử dụng headers từ FormData
    });
    console.log("Upload success, URL:", response.data.data.url);
    return response.data.data.url;
  } catch (error) {
    console.error("Error uploading to ImgBB:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      errorDetails: error.response?.data?.error,
    });

    let errorMessage = error.message;
    if (error.response?.data?.error) {
      errorMessage =
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : error.response.data.error.message || JSON.stringify(error.response.data.error);
    }

    throw new Error(`Failed to upload image to ImgBB: ${errorMessage}`);
  }
};

const uploadAvatar = async (req, res) => {
  const user_id = req.params.id;
  const file = req.file;

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    if (!file) {
      return res.status(400).json({ message: "Vui lòng upload file ảnh" });
    }

    console.log("Processing file:", file);

    // Upload ảnh lên ImgBB và lấy URL
    const imageUrl = await uploadImageToImgBB(file.path); // Sử dụng file.path

    await User.update(
      { avt: imageUrl },
      { where: { user_id } }
    );

    // Xóa file tạm sau khi upload thành công
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    const updatedUser = await User.findByPk(user_id);
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Upload ảnh và cập nhật avatar thành công",
    });
  } catch (err) {
    console.error("Error uploading avatar:", err);
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }
    res.status(500).json({ error: err.message });
  }
};

const createInstructorsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng upload file Excel" });
    }

    const filePath = req.file.path; // Lưu đường dẫn file để xóa sau
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let errors = [];
    let newUsers = [];

    const defaultPassword = "1111";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (let row of worksheet) {
      const { username, email, fullname, gender, avt, birth } = row;

      if (!username || !email) {
        errors.push(`Dòng ${worksheet.indexOf(row) + 2}: Thiếu thông tin bắt buộc (username hoặc email)`);
        continue;
      }

      const emailUser = await User.findOne({ where: { email } });
      const userName = await User.findOne({ where: { username } });

      if (emailUser) {
        errors.push(`Dòng ${worksheet.indexOf(row) + 2}: Email ${email} đã tồn tại`);
        continue;
      }
      if (userName) {
        errors.push(`Dòng ${worksheet.indexOf(row) + 2}: Username ${username} đã tồn tại`);
        continue;
      }

      newUsers.push({
        username,
        password: hashedPassword,
        email,
        fullname,
        gender,
        avt: "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
        birth,
        role_id: 2,
      });
    }

    if (errors.length > 0) {
      await fs.unlink(filePath).catch(err => console.error('Không thể xóa file:', err));
      return res.status(400).json({ message: errors.join(", ") });
    }

    await User.bulkCreate(newUsers);
    await fs.unlink(filePath).catch(err => console.error('Không thể xóa file:', err));
    res.status(201).json({ message: "Thêm nhiều giảng viên thành công" });
  } catch (err) {
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => console.error('Không thể xóa file:', err));
    }
    res.status(500).json({ error: err.message });
  }
};

// Hàm thêm nhiều sinh viên từ file Excel
const createStudentsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng upload file Excel" });
    }

    const filePath = req.file.path; // Lưu đường dẫn file để xóa sau
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let errors = [];
    let newUsers = [];

    const defaultPassword = "1111";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (let row of worksheet) {
      const { username, email, fullname, gender, avt, birth } = row;

      if (!username || !email) {
        errors.push(`Dòng ${worksheet.indexOf(row) + 2}: Thiếu thông tin bắt buộc (username hoặc email)`);
        continue;
      }

      const emailUser = await User.findOne({ where: { email } });
      const userName = await User.findOne({ where: { username } });

      if (emailUser) {
        errors.push(`Dòng ${worksheet.indexOf(row) + 2}: Email ${email} đã tồn tại`);
        continue;
      }
      if (userName) {
        errors.push(`Dòng ${worksheet.indexOf(row) + 2}: Username ${username} đã tồn tại`);
        continue;
      }

      newUsers.push({
        username,
        password: hashedPassword,
        email,
        fullname,
        gender,
        avt: "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
        birth,
        role_id: 1,
      });
    }

    if (errors.length > 0) {
      await fs.unlink(filePath).catch(err => console.error('Không thể xóa file:', err));
      return res.status(400).json({ message: errors.join(", ") });
    }

    await User.bulkCreate(newUsers);
    await fs.unlink(filePath).catch(err => console.error('Không thể xóa file:', err));
    res.status(201).json({ message: "Thêm nhiều sinh viên thành công" });
  } catch (err) {
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(err => console.error('Không thể xóa file:', err));
    }
    res.status(500).json({ error: err.message });
  }
};
// Hàm tạo user mới
const createUser = async (req, res) => {
  const { username, password, email, fullname, gender, avt, birth } = req.body;

  let errors = [];
  let emailUser = await User.findOne({ where: { email } });
  let userName = await User.findOne({ where: { username } });

  if (emailUser) errors.push("Email đã tồn tại");
  if (userName) errors.push("Username đã tồn tại");

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(", ") });
  }

  let hashedPassword = await bcrypt.hash(password, 10);
  try {
    let user = new User({
      username,
      password: hashedPassword,
      email,
      fullname,
      gender,
      avt: "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
      birth,
      role_id: 1,
    });
    await user.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hàm tạo instructor mới
const createInstructor = async (req, res) => {
  const { username, password, email, fullname, gender, avt, birth } = req.body;

  let errors = [];
  if (!username) errors.push("Username là bắt buộc");
  if (!password) errors.push("Password là bắt buộc");
  if (!email) errors.push("Email là bắt buộc");

  let emailUser = await User.findOne({ where: { email } });
  let userName = await User.findOne({ where: { username } });

  if (emailUser) errors.push("Email đã tồn tại");
  if (userName) errors.push("Username đã tồn tại");

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(", ") });
  }

  let hashedPassword = await bcrypt.hash(password, 10);
  try {
    let user = new User({
      username,
      password: hashedPassword,
      email,
      fullname,
      gender,
      avt: "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
      birth,
      role_id: 2,
    });
    await user.save();
    res.status(201).json({ message: "Tạo instructor thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin user
const updateUserById = async (req, res) => {
  const user_id = req.params.id;
  const { username, password, email, fullname, gender, avt, birth } = req.body;
  try {
    let user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    let updateData = { username, email, fullname, gender, avt, birth };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.update(updateData, { where: { user_id } });
    res.status(200).json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'username', 'email', 'birth', 'avt', 'gender', 'fullname'],
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getStudents = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role_id: 1 } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getInstructors = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role_id: 2 } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getUserById = async (req, res) => {
  const user_id = req.params.id;
  try {
    const user = await User.findOne({
      where: { user_id: user_id },
      attributes: ['user_id', 'username', 'email', 'birth', 'avt', 'gender', 'fullname'],
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteStudentById = async (req, res) => {
  const user_id = req.params.id;
  try {
    let user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    await User.destroy({ where: { user_id } });
    res.status(200).json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createInstructor,
  createUser,
  getUsers,
  updateUserById,
  getUserById,
  deleteStudentById,
  getStudents,
  getInstructors,
  createStudentsFromExcel,
  createInstructorsFromExcel,
  uploadAvatar
};

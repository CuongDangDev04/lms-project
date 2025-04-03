const { User } = require("../../models/index");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require('fs'); // Import fs đồng bộ
const fsPromises = require('fs').promises; // Import fs.promises cho bất đồng bộ
const moment = require('moment');

// Hàm upload ảnh lên ImgBB và lấy URL
const uploadImageToImgBB = async (filePath) => {
  const apiKey = process.env.API_KEY_UPLOAD_IMG;
  const url = "https://api.imgbb.com/1/upload";

  if (!apiKey) {
    throw new Error("API_KEY_UPLOAD_IMG is not defined in .env");
  }

  if (!fs.existsSync(filePath)) { // Sử dụng fs đồng bộ
    throw new Error(`File does not exist at path: ${filePath}`);
  }

  const formData = new FormData();
  formData.append("image", fs.createReadStream(filePath)); // Sử dụng fs đồng bộ
  formData.append("key", apiKey);

  try {
    console.log("Uploading to ImgBB with file:", filePath);
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
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

// Hàm upload avatar
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
    const imageUrl = await uploadImageToImgBB(file.path);

    await User.update(
      { avt: imageUrl },
      { where: { user_id } }
    );

    // Xóa file tạm bằng fs.promises
    await fsPromises.unlink(file.path).catch(err => console.error("Error deleting temp file:", err));

    const updatedUser = await User.findByPk(user_id);
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "Upload ảnh và cập nhật avatar thành công",
    });
  } catch (err) {
    console.error("Error uploading avatar:", err);
    if (file && file.path) {
      await fsPromises.unlink(file.path).catch(err => console.error("Error deleting temp file:", err));
    }
    res.status(500).json({ error: err.message });
  }
};

// Hàm thêm nhiều giảng viên từ file Excel
const createInstructorsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let errors = [];
    let newUsers = [];

    const defaultPassword = "1111";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (let row of worksheet) {
      const { username, email, fullname, birth, gender } = row;

      if (!username || !email) {
        errors.push(`Row ${worksheet.indexOf(row) + 2}: Missing required information (username or email)`);
        continue;
      }

      const emailUser = await User.findOne({ where: { email } });
      const userName = await User.findOne({ where: { username } });

      if (emailUser) {
        errors.push(`Row ${worksheet.indexOf(row) + 2}: Email ${email} already exists`);
        continue;
      }
      if (userName) {
        errors.push(`Row ${worksheet.indexOf(row) + 2}: Username ${username} already exists`);
        continue;
      }

      let genderValue;
      if (gender === 1 || gender === "1") {
        genderValue = true;
      } else if (gender === 0 || gender === "0") {
        genderValue = false;
      } else {
        errors.push(`Row ${worksheet.indexOf(row) + 2}: Invalid gender value (${gender})`);
        continue;
      }

      let birthValue = null;
      if (birth) {
        if (typeof birth === "number") {
          const excelDate = XLSX.SSF.parse_date_code(birth);
          birthValue = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
        } else {
          const parsedDate = moment(birth, ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"], true);
          if (parsedDate.isValid()) {
            birthValue = parsedDate.toDate();
          } else {
            errors.push(`Row ${worksheet.indexOf(row) + 2}: Invalid birth date (${birth})`);
            continue;
          }
        }
      }

      newUsers.push({
        username,
        password: hashedPassword,
        email,
        fullname,
        gender: genderValue,
        avt: "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
        birth: birthValue,
        role_id: 2,
      });
    }

    if (errors.length > 0) {
      console.log('Errors found:', errors);
      await fsPromises.unlink(filePath).catch(err => console.error('Could not delete file:', err));
      return res.status(400).json({ message: errors.join(", ") });
    }

    await User.bulkCreate(newUsers);
    console.log('Instructors created successfully');
    await fsPromises.unlink(filePath).catch(err => console.error('Could not delete file:', err));
    res.status(201).json({ message: "Successfully added multiple instructors" });
  } catch (err) {
    console.error('Error in createInstructorsFromExcel:', err);
    if (req.file && req.file.path) {
      await fsPromises.unlink(req.file.path).catch(err => console.error('Could not delete file:', err));
    }
    res.status(500).json({ error: err.message });
  }
};

// Hàm thêm nhiều sinh viên từ file Excel
const createStudentsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an Excel file" });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

    let errors = [];
    let newUsers = [];
    const defaultPassword = "1111";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (let [index, row] of worksheet.entries()) {
      const { username, email, fullname, gender, avt, birth } = row;
      const rowNum = index + 2; // Excel rows start from 2 (excluding header)

      if (!username || !email || !fullname) {
        errors.push(`Row ${rowNum}: Missing required fields (username, email, fullname)`);
        continue;
      }

      const emailUser = await User.findOne({ where: { email } });
      const userName = await User.findOne({ where: { username } });
      if (emailUser) {
        errors.push(`Row ${rowNum}: Email ${email} already exists`);
        continue;
      }
      if (userName) {
        errors.push(`Row ${rowNum}: Username ${username} already exists`);
        continue;
      }

      let genderValue = null;
      if (gender === 1 || gender === "1") {
        genderValue = true;
      } else if (gender === 0 || gender === "0") {
        genderValue = false;
      } else {
        errors.push(`Row ${rowNum}: Invalid gender value (${gender})`);
        continue;
      }

      let birthValue = null;
      if (birth) {
        if (typeof birth === "number") {
          // Nếu birth là kiểu số (Excel date number), chuyển đổi sang định dạng ngày tháng
          const excelDate = XLSX.SSF.parse_date_code(birth);
          birthValue = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
        } else {
          // Thử nhiều định dạng ngày tháng khác nhau
          const parsedDate = moment(birth.trim(), ["D/M/YY", "D/M/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"], true);
          if (parsedDate.isValid()) {
            birthValue = parsedDate.toDate();
          } else {
            errors.push(`Row ${rowNum}: Invalid birth date format (${birth})`);
            continue;
          }
        }
      }


      newUsers.push({
        username,
        password: hashedPassword,
        email,
        fullname,
        gender: genderValue,
        avt: avt || "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
        birth: birthValue,
        role_id: 1,
      });
    }

    if (errors.length > 0) {
      console.log("Errors found:", errors);
      await fsPromises.unlink(filePath);  // Dùng fs.promises.unlink
      return res.status(400).json({ message: errors });
    }

    await User.bulkCreate(newUsers);
    console.log("Users created successfully");
    await fsPromises.unlink(filePath);  // Dùng fs.promises.unlink
    res.status(201).json({ message: "Successfully added multiple students" });
  } catch (err) {
    console.error("Error in createStudentsFromExcel:", err);
    if (req.file && req.file.path) {
      await fsPromises.unlink(req.file.path).catch(err => console.error("Could not delete file:", err));
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
      avt: avt || "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
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
      avt: avt || "https://i.ibb.co/jkftcHB2/1741877635358-user.webp",
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

// Lấy danh sách tất cả user
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

// Lấy danh sách sinh viên
const getStudents = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role_id: 1 } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách giảng viên
const getInstructors = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role_id: 2 } });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy thông tin user theo ID
const getUserById = async (req, res) => {
  const user_id = req.params.id;
  try {
    const user = await User.findOne({
      where: { user_id: user_id },
      attributes: ['user_id', 'username', 'email', 'birth', 'avt', 'gender', 'fullname', 'role_id'],
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa sinh viên theo ID
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
  uploadAvatar,
};
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { validAccessTokens, refreshTokens } = require("../../config/tokenStorage");
const Role = require("../../models/role.model");
const transporter = require("../../config/nodemailer");
const { Op } = require("sequelize");
dotenv.config()

/* ------------------ BIẾN TOÀN CỤC - SECRET  ------------------*/

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH = process.env.JWT_REFRESH;
const resetCodes = {};

/* ------------------ Bao gồm Login Và RefreshToken ------------------*/

const deactivateAccount = async (req, res) => {
    try {
        const { user_id, user_status } = req.body;

        // Kiểm tra nếu user_id hoặc user_status không được cung cấp
        if (!user_id || user_status === undefined) {
            return res.status(400).json({ message: "Thiếu thông tin user_id hoặc user_status" });
        }


        // Kiểm tra xem tài khoản có tồn tại không
        const user = await User.findOne({
            where: { user_id }
        });
        if (!user) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        // Cập nhật trạng thái tài khoản
        await user.update({ user_status });

        // Trả về thông báo thành công dựa trên trạng thái mới
        const actionMessage = user_status ? "Kích hoạt" : "Vô hiệu hóa";
        res.status(200).json({ message: `${actionMessage} tài khoản thành công` });
    } catch (err) {
        console.error("Lỗi backend:", err);
        res.status(500).json({ message: "Cập nhật trạng thái tài khoản thất bại" });
    }
};
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const student = await User.findOne({
            where: {
                username,
                user_status: true
            },

        });

        if (!student) {
            return res.status(400).json({ message: "MSSV không tồn tại" });
        }

        const passwordValid = await bcrypt.compare(password, student.password);
        if (!passwordValid) {
            return res.status(400).json({ message: "Mật khẩu không đúng" });
        }
        // Lấy role từ bảng roles

        const payload = { id: student.user_id, username: student.username, role_id: student.role_id };
        const loginToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
        const refreshToken = jwt.sign(payload, JWT_REFRESH, { expiresIn: "7d" });

        validAccessTokens.add(loginToken);
        refreshTokens.push(refreshToken);

        res.status(200).json({
            message: "Đăng nhập thành công",
            loginToken,
            refreshToken,
            user: {
                id: student.user_id,
                username: student.username,
                fullname: student.fullname,
                role_id: student.role_id
            }
        });

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Đăng nhập thất bại" });
    }
};

const refreshToken = async (req, res) => {
    const receivedToken = req.body.refreshToken || req.headers.authorization?.split(" ")[1];

    if (!receivedToken || !refreshTokens.includes(receivedToken)) {
        return res.status(403).json({ message: "Refresh Token không hợp lệ hoặc không tồn tại, vui lòng đăng nhập lại." });
    }

    jwt.verify(receivedToken, JWT_REFRESH, (err, decoded) => {
        if (err) {
            refreshTokens.splice(refreshTokens.indexOf(receivedToken), 1);
            return res.status(403).json({ message: "Refresh Token đã hết hạn, vui lòng đăng nhập lại." });
        }

        // Xóa Access Token cũ của user
        const tokensToRemove = [];
        validAccessTokens.forEach(token => {
            try {
                const decodedToken = jwt.verify(token, JWT_SECRET);
                if (decodedToken.id === decoded.id) {
                    tokensToRemove.push(token);
                }
            } catch (err) {
            }
        });
        tokensToRemove.forEach(token => validAccessTokens.delete(token));

        // Cấp Access Token mới
        const payload = { id: decoded.id, username: decoded.username, role_id: decoded.role_id };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

        validAccessTokens.add(newAccessToken);

        res.status(200).json({
            message: "Cấp lại Access Token thành công",
            accessToken: newAccessToken
        });
    });
};

// Gửi mã xác nhận qua email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại!" });
        }

        // Tạo mã xác nhận ngẫu nhiên
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Mã 6 chữ số
        resetCodes[email] = {
            code: resetCode,
            expires: Date.now() + 15 * 60 * 1000, // Hết hạn sau 15 phút
        };

        // Cấu hình email với nội dung tùy chỉnh
        const mailOptions = {
            from: `"BrainHub" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Yêu Cầu Đặt Lại Mật Khẩu - LMS", // Tiêu đề mới
            html: `
          <h2>Xin chào ${user.fullname || "Người dùng"},</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản LMS của mình.</p>
          <p>Mã xác nhận của bạn là: <strong>${resetCode}</strong></p>
          <p>Mã này có hiệu lực trong <strong>15 phút</strong>. Vui lòng nhập mã này để tiếp tục quá trình đặt lại mật khẩu.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
          <br/>
          <p>Trân trọng,<br/>Đội ngũ BrainHub</p>
        `, // Nội dung HTML
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Mã xác nhận đã được gửi đến email của bạn!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Không thể gửi email!" });
    }
};
// Đặt lại mật khẩu
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const storedReset = resetCodes[email];
        if (!storedReset || storedReset.code !== code || Date.now() > storedReset.expires) {
            return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn!" });
        }

        const user = await User.findOne({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }

        // Băm mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        // Xóa mã xác nhận sau khi dùng
        delete resetCodes[email];

        res.status(200).json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Đổi mật khẩu thất bại!" });
    }
};




module.exports = { login, refreshToken, forgotPassword, resetPassword, deactivateAccount };
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { validAccessTokens, refreshTokens } = require("../../config/tokenStorage");
dotenv.config()

/* ------------------ BIẾN TOÀN CỤC - SECRET  ------------------*/

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH = process.env.JWT_REFRESH;

/* ------------------ Bao gồm Login Và RefreshToken ------------------*/



const login = async (req, res) => {
    try {
        const { password, mssv } = req.body;
        const student = await User.findOne({ where: { mssv } });

        if (!student) {
            return res.status(400).json({ message: "MSSV không tồn tại" });
        }

        const passwordValid = await bcrypt.compare(password, student.password);
        if (!passwordValid) {
            return res.status(400).json({ message: "Mật khẩu không đúng" });
        }

        const payload = { id: student.user_id, mssv: student.mssv };
        const loginToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "20s" });
        const refreshToken = jwt.sign(payload, JWT_REFRESH, { expiresIn: "7h" });

        validAccessTokens.add(loginToken);
        refreshTokens.push(refreshToken);

        res.status(200).json({
            message: "Đăng nhập thành công",
            loginToken,
            refreshToken,
            user: {
                id: student.user_id,
                mssv: student.mssv,
                full_name: student.full_name,
                role: student.role
            }
        });

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Đăng nhập thất bại" });
    }
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: "Refresh Token không hợp lệ hoặc không tồn tại, vui lòng đăng nhập lại." });
    }

    jwt.verify(refreshToken, JWT_REFRESH, (err, decoded) => {
        if (err) {
            refreshTokens = refreshTokens.filter(token => token !== refreshToken);
            return res.status(403).json({ message: "Refresh Token đã hết hạn, vui lòng đăng nhập lại." });
        }

        // Xóa tất cả Access Token cũ của user này
        [...validAccessTokens].forEach(token => {
            jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
                if (!err && decodedToken.id === decoded.id) {
                    validAccessTokens.delete(token);
                }
            });
        });

        // Cấp Access Token mới
        const newAccessToken = jwt.sign(
            { id: decoded.id, mssv: decoded.mssv },
            JWT_SECRET,
            { expiresIn: "20s" }
        );

        // Lưu Access Token mới vào danh sách hợp lệ
        validAccessTokens.add(newAccessToken);

        res.status(200).json({
            message: "Cấp lại AccessToken thành công",
            accessToken: newAccessToken
        });
    });
};

// const refreshToken = async(req,res)=>{
//     const refreshToken = req.body
//     if(!refreshToken){
//         res.status(403).json({message:"Refresh Token không hợp lệ hoặc không tồn tại vui lòng thử lại"})
//     }
//     jwt.verify(refreshToken,JWT_REFRESH,(err,decoded)=>{
//         if(err){
//             res.status(403).json({message:"Refresh Token không hợp lệ hoặc không tồn tại vui lòng thử lại"})
//         }
//         let payload = decoded
//         const maintainLoginToken = jwt.sign(payload,JWT_REFRESH,{expiresIn:"1h"}) 
//         res.status(200).json({message
//             :"Refresh Token thành công, phiên mới vui vẻ , gia đình của bạn sẽ an toàn trong 1h",
//             refreshToken:maintainLoginToken
//         }) 
//     })
// }


module.exports = { login, refreshToken }
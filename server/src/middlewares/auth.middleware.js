const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { validAccessTokens } = require('../config/tokenStorage');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

/* ------------------ Middleware kiểm tra token và quyền ------------------*/

const verifyTokenAndRole = (...allowedRoles) => (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            const message = err.name === 'TokenExpiredError' ? 'Token is expired' : 'Unauthorized';
            return res.status(401).json({ message });
        }

        // Kiểm tra token hợp lệ
        if (!validAccessTokens.has(token)) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã bị thu hồi' });
        }

        req.user = decoded;

        // Kiểm tra nếu role_id của user có trong danh sách được phép
        if (!req.user || !allowedRoles.includes(req.user.role_id)) {
            return res.status(403).json({ message: `Bạn không có quyền truy cập! Yêu cầu role_id: ${allowedRoles.join(', ')}` });
        }

        next();
    });
};


const getRequestUser = () => (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing' });
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            const message = err.name === 'TokenExpiredError' ? 'Token is expired' : 'Unauthorized';
            return res.status(401).json({ message });
        }

        // Kiểm tra token hợp lệ
        if (!validAccessTokens.has(token)) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã bị thu hồi' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = { verifyTokenAndRole, validAccessTokens, getRequestUser };

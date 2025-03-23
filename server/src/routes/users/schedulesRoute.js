const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/users/schedulesController');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

// Route để lấy lịch học của người dùng
router.get('/', verifyTokenAndRole(1, 2), scheduleController.getSchedule);
router.get('/today', verifyTokenAndRole(1, 2), scheduleController.getScheduleToday);


module.exports = router;
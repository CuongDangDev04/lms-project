// routes/admin/dashboard.js
const express = require("express");
const router = express.Router();
const dbReportController = require("../../controllers/admin/dashboardReportController");
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.get('/', verifyTokenAndRole(3), dbReportController.getDashboardStats);
router.get('/stats', verifyTokenAndRole(3), dbReportController.getStats);
router.get('/export', verifyTokenAndRole(3), dbReportController.exportStats);

module.exports = router;
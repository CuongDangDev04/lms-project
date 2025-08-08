// routes/admin/dashboard.js
const express = require("express");
const router = express.Router();
const dbReportController = require("../../controllers/admin/dashboardReportController");
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.get('/', dbReportController.getDashboardStats);
router.get('/stats', dbReportController.getStats);
router.get('/export', dbReportController.exportStats);

module.exports = router;
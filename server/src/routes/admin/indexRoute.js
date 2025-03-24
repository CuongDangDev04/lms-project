const express = require('express');
const router = express.Router();

// Import cac route bennn trond Admin Route
const userAdminRoute = require('./userRoute')
const courseAdminRoute = require('./courseRoute')
const classAdminRoute = require('./classRoute')
const classStatusAdminRoute = require('./classStatusRoute');
const classRoomAssigmentAdminRoute = require('./classAssigmentRoute');
const classRoomAdminRoute = require('./classRoomRoute');
const userParticipationAdminRoute = require('./userParticipationsRoute')
const dbReportAdminRoute = require('./dbReportRoute');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

//Xuat route su dung
router.use('/users', userAdminRoute);
router.use('/courses', courseAdminRoute);
router.use('/classes', classAdminRoute);
router.use('/classrooms',verifyTokenAndRole(3), classRoomAdminRoute, classRoomAssigmentAdminRoute);
router.use('/classStatus',verifyTokenAndRole(3), classStatusAdminRoute);
router.use('/user-participations',verifyTokenAndRole(3), userParticipationAdminRoute);
router.use('/dashboard-stats',verifyTokenAndRole(3), dbReportAdminRoute);

module.exports = router;
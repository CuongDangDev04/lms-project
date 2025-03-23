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

//Xuat route su dung
router.use('/users', userAdminRoute);
router.use('/courses', courseAdminRoute);
router.use('/classes', classAdminRoute);
router.use('/classrooms', classRoomAdminRoute, classRoomAssigmentAdminRoute);
router.use('/classStatus', classStatusAdminRoute);
router.use('/user-participations', userParticipationAdminRoute);
router.use('/dashboard-stats', dbReportAdminRoute);

module.exports = router;
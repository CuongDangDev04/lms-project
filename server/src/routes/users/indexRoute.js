const express = require('express');
const router = express.Router();

// Import cac route bennn trond User Route
const scheduleUserRoute = require('./schedulesRoute');
const courseRoute = require('./coursesRoute');
// const messageRoute = require('./messageRoute');
const memberController = require('../users/memberRoute')
const assignmentRoute = require('./assignmentRoute');
const lectureRoute = require('../../routes/users/lectureRoute')
const instructorRoute = require('../../routes/users/instructorRoute')
const submissionRoute = require('../../routes/users/submissionRoute')
const { assign } = require('nodemailer/lib/shared');

//Xuat route su dung
router.use('/coursesAssigned', courseUserRoute);
router.use('/schedule', scheduleUserRoute);
router.use('/courses', courseRoute);
// router.use('/messages', messageRoute);
router.use('/members', memberController);
router.use('/assignments', assignmentRoute);
router.use('/lectures', lectureRoute);
router.use('/instructor', instructorRoute)
router.use('/submission', submissionRoute)
module.exports = router;



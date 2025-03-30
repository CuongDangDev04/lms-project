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
const quizRoute = require('../../routes/users/quizRoute')
const { assign } = require('nodemailer/lib/shared');
const gradeRoute = require('./gradeRoute')
//Xuat route su dung
router.use('/schedule', scheduleUserRoute);
router.use('/grade', gradeRoute);
router.use('/courses', courseRoute);
// router.use('/messages', messageRoute);
router.use('/members', memberController);
router.use('/assignments', assignmentRoute);
router.use('/lectures', lectureRoute);
router.use('/instructor', instructorRoute)
router.use('/submission', submissionRoute)
router.use('/quiz',quizRoute )
module.exports = router;



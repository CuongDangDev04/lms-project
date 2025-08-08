const express = require('express');
const router = express.Router();
const quizController = require('../../controllers/users/quizController');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.post('/exams', quizController.createExam);
router.get('/exams/classrooms/:classroom_id/', quizController.getExamsByClassroom);
router.get('/exams/:exam_id', quizController.getExamDetails);
router.post('/exams/submit', quizController.submitExam);
router.get('/exams/result/:exam_id',verifyTokenAndRole(1,2), quizController.getResult);
router.get('/exams/results/:exam_id/', quizController.getExamResults);
router.get('/all-classrooms', quizController.getAllClassrooms);
router.post('/exams/uploadword', quizController.importExamFromWord);
router.get('/listexams/classroom/:classroom_id', quizController.getExamsByClassroomSimple);
router.post('/exams/:exam_id/progress', quizController.saveExamProgress);
router.get('/exams/:exam_id/progress', quizController.getExamProgress);
module.exports = router;
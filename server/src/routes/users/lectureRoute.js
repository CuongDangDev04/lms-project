const express = require('express');
const router = express.Router();
const { uploadLecture, showLectureOnClassroom, getUserParticipationId, DeleteLectureOnId,updateLecture,downloadLecture } = require('../../controllers/users/lectureController');
const upload = require('../../middlewares/multerConfig');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.delete('/:lecture_id', DeleteLectureOnId);
router.post('/upload/:classroom_id', verifyTokenAndRole(2), upload.array('files', 10), uploadLecture);
router.get('/classroom/:classroom_id', showLectureOnClassroom);
router.get('/user-participation/:userId/:classroomId', getUserParticipationId);
router.put('/:lecture_id',upload.array('files',10),updateLecture );
router.get('/download/:lecture_id', downloadLecture); // Tải file
module.exports = router; 
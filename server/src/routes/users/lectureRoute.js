const express = require('express');
const router = express.Router();
const { showLectureOnClassroom, getUserParticipationId, DeleteLectureOnId,updateLecture,downloadLectureSupabase,uploadLecture } = require('../../controllers/users/lectureController');
const upload = require('../../middlewares/multerConfig');
const {getRequestUser } = require('../../middlewares/auth.middleware');

router.delete('/:lecture_id', DeleteLectureOnId);
router.get('/classroom/:classroom_id', showLectureOnClassroom);
router.get('/user-participation/:userId/:classroomId', getUserParticipationId);
router.put('/:lecture_id',upload.array('files',10),updateLecture );
router.post(
    '/upload/:classroom_id/',
    getRequestUser(),
    upload.array('files',10), // Xử lý nhiều file
    uploadLecture
  );
  router.get('/download/:lecture_id', getRequestUser(), downloadLectureSupabase);
module.exports = router; 
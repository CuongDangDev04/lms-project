const express = require('express');
const router = express.Router();
const classroomController = require('../../controllers/admin/classRoomController');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.post('/',verifyTokenAndRole(3), classroomController.createClassroom);

router.get('/',verifyTokenAndRole(3), classroomController.getAllClassrooms);

router.get('/:id',verifyTokenAndRole(3), classroomController.getClassroomById);

router.put('/:id',verifyTokenAndRole(3), classroomController.updateClassroom);

router.delete('/:id',verifyTokenAndRole(3), classroomController.deleteClassroom);

module.exports = router;
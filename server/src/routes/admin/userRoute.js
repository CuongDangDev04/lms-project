const createController = require('../../controllers/admin/userController')
const express = require('express');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload');
const router = express.Router();

router.post('/create',verifyTokenAndRole(3), createController.createUser);
router.post('/create-instructor',verifyTokenAndRole(3), createController.createInstructor);
router.get('/', createController.getUsers);
router.get('/students' , createController.getStudents);
router.get('/instructors', createController.getInstructors);
router.get('/:id', createController.getUserById);
router.put('/:id',verifyTokenAndRole(3), createController.updateUserById);
router.delete('/:id' , verifyTokenAndRole(3), createController.deleteStudentById);
router.post("/upload", upload.single("file"), createController.createStudentsFromExcel);
router.post("/uploadgv", upload.single("file"), createController.createInstructorsFromExcel);
router.post("/:id/uploadimg", upload.single("file"), createController.uploadAvatar);
module.exports = router;


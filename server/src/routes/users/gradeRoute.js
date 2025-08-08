const { getClassGrades } = require("../../controllers/users/gradeController");
const express = require("express");
const router = express.Router();
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');


router.get('/:classroomId', verifyTokenAndRole(2), getClassGrades);

module.exports = router;
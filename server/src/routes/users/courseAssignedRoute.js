const express = require("express");
const {
    getCourses,
    getCoursesToAssigned,
    assignedCourse,
    deleteCoureToAssigned,

} = require("../../controllers/users/coursesAssignedController");
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyTokenAndRole(1), getCourses);
router.get('/users/self/enrollments', verifyTokenAndRole(1), getCoursesToAssigned);
router.post('/register/:classroomId', verifyTokenAndRole(1), assignedCourse);
router.delete('/unregister/:classroomId', verifyTokenAndRole(1), deleteCoureToAssigned);

module.exports = router;
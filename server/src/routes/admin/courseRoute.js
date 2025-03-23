const express = require("express");
const router = express.Router();
const courseController = require("../../controllers/admin/courseController");
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload');

router.get('/', courseController.getCourses);
router.get("/:id", verifyTokenAndRole(3), courseController.getCourseByID);
router.post("/create" , courseController.createCourse);
router.post("/createByExcel", upload.single("file"), courseController.createCourseByExcel);
router.put("/:id", verifyTokenAndRole(3), courseController.updateCourse);
router.delete('/:id', verifyTokenAndRole(3), courseController.deleteCourseById);

module.exports = router;

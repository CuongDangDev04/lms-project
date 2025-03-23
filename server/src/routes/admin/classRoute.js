const express = require("express");
const router = express.Router();
const classController = require("../../controllers/admin/classesController");
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload');

router.get('/', verifyTokenAndRole(3), classController.getClasses);
router.get("/:id", verifyTokenAndRole(3), classController.getClassByID);
router.post("/create", verifyTokenAndRole(3), classController.createClass);
router.post("/createByExcel", upload.single("file"), classController.createClassByExcel);
router.put("/:id", verifyTokenAndRole(3), classController.updateClass);
router.delete('/:id', verifyTokenAndRole(3), classController.deleteClassById);

module.exports = router;

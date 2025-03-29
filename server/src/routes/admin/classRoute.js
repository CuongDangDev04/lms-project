const express = require("express");
const router = express.Router();
const classController = require("../../controllers/admin/classesController");
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload');

router.get('/', classController.getClasses);
router.get("/:id", classController.getClassByID);
router.post("/create", classController.createClass);
router.post("/createByExcel", classController.createClassByExcel);
router.put("/:id", classController.updateClass);
router.delete('/:id', classController.deleteClassById);

module.exports = router;

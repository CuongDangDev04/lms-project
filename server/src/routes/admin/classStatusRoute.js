const express = require('express');
const router = express.Router();
const classStatusController = require('../../controllers/admin/classStatusController');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.post('/',verifyTokenAndRole(3), classStatusController.createClassStatus);

router.get('/',verifyTokenAndRole(3), classStatusController.getAllClassStatuses);

router.get('/:id',verifyTokenAndRole(3), classStatusController.getClassStatusById);

router.put('/:id',verifyTokenAndRole(3), classStatusController.updateClassStatus);

router.delete('/:id',verifyTokenAndRole(3), classStatusController.deleteClassStatus);

module.exports = router;
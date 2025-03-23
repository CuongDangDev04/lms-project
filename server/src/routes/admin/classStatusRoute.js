const express = require('express');
const router = express.Router();
const classStatusController = require('../../controllers/admin/classStatusController');

router.post('/', classStatusController.createClassStatus);

router.get('/', classStatusController.getAllClassStatuses);

router.get('/:id', classStatusController.getClassStatusById);

router.put('/:id', classStatusController.updateClassStatus);

router.delete('/:id', classStatusController.deleteClassStatus);

module.exports = router;
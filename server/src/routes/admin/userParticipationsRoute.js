const express = require('express');
const router = express.Router();
const userParticipations = require('../../controllers/admin/user-participationsController');

router.get('/', userParticipations.getUserParticipations);


module.exports = router;
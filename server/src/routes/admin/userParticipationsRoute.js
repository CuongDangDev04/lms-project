const express = require('express');
const router = express.Router();
const userParticipations = require('../../controllers/admin/user-participationsController');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');

router.get('/',verifyTokenAndRole(3), userParticipations.getUserParticipations);


module.exports = router;
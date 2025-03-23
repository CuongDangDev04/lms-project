const loginController = require('../../controllers/auth/authController')
const express = require('express');
const { verifyTokenAndRole } = require('../../middlewares/auth.middleware');
const router = express.Router();


router.post('/login', loginController.login);

router.post('/refresh', loginController.refreshToken);

router.post('/forgot-password', loginController.forgotPassword);
router.post('/reset-password', loginController.resetPassword);
router.post('/deactivate', loginController.deactivateAccount);
module.exports = router;


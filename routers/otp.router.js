const express = require('express');
const {createOTPMail, confirmOTP} = require('../controllers/otp.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('', createOTPMail);
router.get('/auth', protect, createOTPMail);
router.post('/confirm', confirmOTP);
router.post('/confirm-auth', protect, confirmOTP);

module.exports = router;
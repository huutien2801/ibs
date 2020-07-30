const express = require('express');
const {createOTPMail, confirmOTP} = require('../controllers/otp.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('', protect, createOTPMail);
router.post('/confirm', protect, confirmOTP);

module.exports = router;
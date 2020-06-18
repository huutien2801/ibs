const express = require('express');
const {createOTPMail, confirmOTP} = require('../controllers/otp.controller');

const router = express.Router();

router.get('', createOTPMail);
router.post('/confirm', confirmOTP);

module.exports = router;
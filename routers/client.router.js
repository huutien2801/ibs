const express = require('express');
const {getAccountInfoQLBank, transferMoneyQLBank, confirmOTPTransferMoneyQLBank} = require('../controllers/client.controller');

const router = express.Router();


router.get('/get-info', getAccountInfoQLBank);
router.post('/transfer-money', transferMoneyQLBank);
router.post('/confirm-otp', confirmOTPTransferMoneyQLBank);

module.exports = router;
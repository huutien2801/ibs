const express = require('express');
const {getAccountInfoQLBank, transferMoneyQLBank, confirmOTPTransferMoneyQLBank} = require('../controllers/client.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();


router.get('/get-info', protect, getAccountInfoQLBank);
router.post('/transfer-money', protect, transferMoneyQLBank);
router.post('/confirm-otp', protect, confirmOTPTransferMoneyQLBank);

module.exports = router;
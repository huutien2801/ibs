const express = require('express');
const { createBankAccount, transferMoney, getBankAccountDeposit, getBankAccountStandard, confirmOTPTransferMoney, redeemDepositAccount} = require('../controllers/bank_account.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', protect, createBankAccount);
router.post('/transfer', protect, transferMoney);
router.post('/confirm-transfer', protect, confirmOTPTransferMoney);
router.get('/standard', protect, getBankAccountStandard);
router.get('/deposit', protect, getBankAccountDeposit);
router.post('/redeem', protect, redeemDepositAccount);

module.exports = router;
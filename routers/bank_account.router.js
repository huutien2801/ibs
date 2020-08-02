const express = require('express');
const { createBankAccount, transferMoney, getBankAccountDeposit, getBankAccountStandard, confirmOTPTransferMoney} = require('../controllers/bank_account.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', protect, createBankAccount);
router.post('/transfer', transferMoney);
router.post('/confirm-transfer', confirmOTPTransferMoney);
router.get('/standard', protect, getBankAccountStandard);
router.get('/deposit', protect, getBankAccountDeposit);

module.exports = router;
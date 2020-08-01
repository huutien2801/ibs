const express = require('express');
const { createBankAccount, transferMoney, getBankAccountDeposit, getBankAccountStandard} = require('../controllers/bank_account.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', protect, createBankAccount);
router.post('/transfer', protect, transferMoney);
router.get('/standard', getBankAccountStandard);
router.get('/deposit', getBankAccountDeposit);

module.exports = router;
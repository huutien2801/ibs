const express = require('express');
const { createBankAccount, transferMoney} = require('../controllers/bank_account.controller');

const router = express.Router();

router.post('/create', createBankAccount);
router.post('/transfer', transferMoney);

module.exports = router;
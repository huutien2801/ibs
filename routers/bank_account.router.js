const express = require('express');
const { createBankAccount, transferMoney} = require('../controllers/bank_account.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', createBankAccount);
router.post('/transfer', protect, transferMoney);

module.exports = router;
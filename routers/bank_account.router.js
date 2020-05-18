const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const { createBankAccount} = require('../controllers/bank_account.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/create', createBankAccount);

module.exports = router;
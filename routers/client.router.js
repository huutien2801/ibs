const express = require('express');
const {getAccountInfoQLBank, depositMoneyQLBank} = require('../controllers/client.controller');

const router = express.Router();


router.get('/get-info', getAccountInfoQLBank);
router.post('/deposit-money', depositMoneyQLBank);

module.exports = router;
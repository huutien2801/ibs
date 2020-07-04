const express = require('express');
const { getAllById, depositMoney, getUserLogs} = require('../controllers/exchange_money.controller');

const router = express.Router();

router.get('/history', getAllById);
router.post('/deposit', depositMoney);
router.get('/get-userlogs', getUserLogs);

module.exports = router;
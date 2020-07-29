const express = require('express');
const { getAllById, depositMoney, getUserLogs, getAllHistoryAdmin} = require('../controllers/exchange_money.controller');

const router = express.Router();

router.get('/history', getAllById);
router.post('/deposit', depositMoney);
router.get('/get-userlogs', getUserLogs);
router.get('/get-history-admin', getAllHistoryAdmin);


module.exports = router;
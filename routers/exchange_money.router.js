const express = require('express');
const { getAllById, depositMoney, getUserLogs, getAllHistoryAdmin, getRecMoney, getSenMoney} = require('../controllers/exchange_money.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/history', protect, getAllById);
router.get('/receiver', protect, getRecMoney);
router.get('/sender', protect, getSenMoney)
router.post('/deposit', protect, depositMoney);
router.get('/get-userlogs', protect, getUserLogs);
router.get('/get-history-admin', protect, getAllHistoryAdmin);


module.exports = router;

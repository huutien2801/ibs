const express = require('express');
const { getAllById, depositMoney, getUserLogs, getAllHistoryAdmin} = require('../controllers/exchange_money.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/history', getAllById);
router.post('/deposit', protect, depositMoney);
router.get('/get-userlogs', protect, getUserLogs);
router.get('/get-history-admin', protect, getAllHistoryAdmin);


module.exports = router;
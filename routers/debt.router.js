const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {createRemind, getReminder, getReminded, cancelRemind, payRemind, getAllRemind} = require('../controllers/debt.controller');

const router = express.Router();


router.post('/create', protect, createRemind);
router.get('/reminder', protect, getReminder);
router.get('/reminded', protect, getReminded);
router.put('/cancel', protect, cancelRemind);
router.post('/pay', protect, payRemind);
router.get('', protect, getAllRemind);

module.exports = router;
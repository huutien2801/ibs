const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {rechargeMoneyInAccount} = require('../controllers/user.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.get('/profile', protect, getMe);
router.post('/change-balance', protect, rechargeMoneyInAccount);

module.exports = router;
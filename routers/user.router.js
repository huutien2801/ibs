const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {getInfoUser, rechargeMoneyInAccount, createUser} = require('../controllers/user.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.get('/profile', protect, getMe);
router.post('/change-balance', protect, rechargeMoneyInAccount);
router.get('', protect, getInfoUser);
//router.post('/create', createUser);

module.exports = router;
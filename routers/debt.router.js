const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {createRemind, getReminder, getReminded, cancelRemind, payRemind} = require('../controllers/debt.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/create', createRemind);
router.get('/reminder', getReminder);
router.get('reminded', getReminded);
router.put('/cancel', cancelRemind);
router.post('/pay', payRemind);

module.exports = router;
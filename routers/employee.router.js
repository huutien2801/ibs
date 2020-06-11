const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {depositMoney, getUserLogs} = require('../controllers/employee.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/deposit', depositMoney);
router.get('/get-userlogs', getUserLogs);

module.exports = router;
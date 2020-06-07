const express = require('express');
const { getAllById} = require('../controllers/exchange_money.controller');

const router = express.Router();

router.get('/history', getAllById);

module.exports = router;
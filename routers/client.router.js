const express = require('express');
const {getAccountInfoQLBank} = require('../controllers/client.controller');

const router = express.Router();


router.post('/get-info', getAccountInfoQLBank);

module.exports = router;
const express = require('express');
const { createPartner} = require('../controllers/partner.controller');

const router = express.Router();

router.post('/create', createPartner);

module.exports = router;
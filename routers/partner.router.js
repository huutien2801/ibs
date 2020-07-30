const express = require('express');
const { createPartner} = require('../controllers/partner.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create', protect, createPartner);

module.exports = router;
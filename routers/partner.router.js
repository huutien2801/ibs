const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const { createPartner} = require('../controllers/partner.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/create-partner', createPartner);

module.exports = router;
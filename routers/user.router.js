const express = require('express');
const { getMe } = require('../controllers/auth.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.get('/profile', protect, getMe);

module.exports = router;
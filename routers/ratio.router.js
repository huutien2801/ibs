const express = require('express');
const {getRatio, createRatio, updateRatio} = require('../controllers/ratio.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('', protect, getRatio);
router.post('', protect, createRatio);
router.put('', protect, updateRatio);

module.exports = router;
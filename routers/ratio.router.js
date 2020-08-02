const express = require('express');
const {getRatio, createRatio, updateRatio} = require('../controllers/ratio.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('', getRatio);
router.post('', createRatio);
router.put('', updateRatio);

module.exports = router;
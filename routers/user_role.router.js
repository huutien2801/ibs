const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {changePassword} = require('../controllers/user_role.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/change-password', changePassword);

module.exports = router;
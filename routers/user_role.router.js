const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {changePassword, createUser, getInfoUser, getPartnerInfo} = require('../controllers/user_role.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/change-password', changePassword);
router.post('/create', createUser);
router.get('/get-info', getInfoUser);
router.get('/get-partner', getPartnerInfo)

module.exports = router;
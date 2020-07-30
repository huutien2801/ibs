const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {changePassword, createUser, getInfoUser, getPartnerInfo, updateInfoUser, deleteInfoUser} = require('../controllers/user_role.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/change-password', protect, changePassword);
router.post('/create', protect, createUser);
router.get('/get-info', protect, getInfoUser);
router.get('/get-partner', protect, getPartnerInfo);
router.put('/update', protect, updateInfoUser);
router.delete('/delete', protect, deleteInfoUser);

module.exports = router;
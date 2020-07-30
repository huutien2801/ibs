const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {changePassword, createUser, getInfoUser, getPartnerInfo, updateInfoUser, deleteInfoUser, getInfoUserBy} = require('../controllers/user_role.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/change-password', changePassword);
router.post('/create', protect, createUser);
router.get('/get-info', protect, getInfoUser);
router.get('/get-partner', protect, getPartnerInfo);
router.put('/update', protect, updateInfoUser);
router.delete('/delete', protect, deleteInfoUser);
router.get('/get-info-user-by', getInfoUserBy);
module.exports = router;
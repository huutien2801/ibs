const express = require('express');
const {changePassword, createUser, getInfoUser, getPartnerInfo, updateInfoUser, deleteInfoUser, getInfoUserBy, resetPassword} = require('../controllers/user_role.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/change-password', protect, changePassword);
router.post('/create', createUser);
router.get('/get-info', protect, getInfoUser);
router.get('/get-partner', protect, getPartnerInfo);
router.put('/update', protect, updateInfoUser);
router.delete('/delete', protect, deleteInfoUser);
router.get('/get-info-user-by', protect, getInfoUserBy);
router.post('/reset', resetPassword)
module.exports = router;
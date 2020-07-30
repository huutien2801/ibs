const express = require('express');
const {addUserToList, showList} = require('../controllers/exchange_user.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/add-user', protect, addUserToList);
router.get('/show-user', protect, showList);

module.exports = router;
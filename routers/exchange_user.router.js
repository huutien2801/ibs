const express = require('express');
const { getMe } = require('../controllers/auth.controller');
const {addUserToList, showList} = require('../controllers/exchange_user.controller');

const router = express.Router();

const { protect } = require('../middlewares/auth.middleware');

router.post('/add-user', addUserToList);
router.get('/show-user', showList);

module.exports = router;
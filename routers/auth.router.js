const express = require('express');
const {
  registerEmployee,
  login,
  logout,
  refresh,
} = require("../controllers/auth.controller");
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/employee/register', protect, registerEmployee);
router.post('/login', protect, login);
router.get('/logout', protect, logout);
router.post('/refresh', protect, refresh);

module.exports = router;
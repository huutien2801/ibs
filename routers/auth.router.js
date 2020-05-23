const express = require('express');
const {
  registerEmployee,
  login,
  logout,
  refresh,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post('/employee/register', registerEmployee);
router.post('/login', login);
router.get('/logout', logout);
router.post('/refresh', refresh);

module.exports = router;
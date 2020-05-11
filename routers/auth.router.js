const express = require('express');
const {
    registerEmployee
} = require("../controllers/auth.controller");

const router = express.Router();

router.post('/employee/register', registerEmployee);

module.exports = router;
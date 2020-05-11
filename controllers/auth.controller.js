const User = require('../models/users.model');
const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
require('dotenv').config({
    path: './config/config.env',
});

const { redisIAMClient } = require('../services/redis.service');

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, res) => {
    // Create token
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    // Store in cookie 1h
    const options = {
        expires: new Date(Date.now() + 3600 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // Set browser httpOnly cookies
    res.cookie('access_token', token, options);
    res.cookie('refresh_token', refreshToken, options);
    // Store refresh token in 1 month
    await redisIAMClient.set(
        `RefreshToken:${user.user_id}`,
        refreshToken,
        'EX',
        2592000
    );

    res.status(200).json({
        success: true,
        user,
        token,
        refreshToken,
    });
};

// @desc      Register employee
// @route     POST /api/v1/auth/employee/register
// @access    Public
const registerEmployee = async (req, res, next) => {
    const { username, email, password } = req.body;
    // if (!validateRegisterInput(req.body)) {
    //     return next(ErrorCode.INVALID_PARAMETER);
    // }

    const checkUser = await User.findOne({
        email,
    });
    if (checkUser) {
        return next(ErrorCode.EXISTS_INPUT_INFO);
    }

    const user = await User.create({
        username,
        email,
        password,
        role_id: 3,
    });
    res.status(201).send({
        employee_created: user,
    });
};

module.exports = {
    registerEmployee,
};
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

    // Store refresh token in 2 days
    await redisIAMClient.set(
        `RefreshToken:${user.user_id}`,
        refreshToken,
        'EX',
        20000
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

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
const login = async (req, res, next) => {
    const { email, password } = req.body;
    // if (!validateLoginInput(req.body)) {
    //   return next(ErrorCode.WRONG_PARAMETER);
    // }
    // Check for user
    const user = await User.findOne({ email });
  
    if (!user) {
      return next(ErrorCode.REQUEST_TIMEOUT);
    }
    // Check if password matches
    const isMatch = await user.matchPassword(password);
  
    if (!isMatch) {
      return next(ErrorCode.REQUEST_TIMEOUT);
    }
    sendTokenResponse(user, res);
  };
  
  // @desc      Log user out / clear cookie
  // @route     GET /api/v1/auth/logout
  // @access    Private
  const logout = async (req, res, next) => {
    // await redisIAMClient.del(`RefreshToken:${req.user.user_id}`);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.redirect('/');
  };
  
  // @desc      Get current logged in user
  // @route     POST /api/v1/auth/me
  // @access    Private
  const getMe = async (req, res, next) => {
    const user = await User.findOne({
      user_id: req.user.user_id,
      email: req.user.email,
    }).select('-password');
  
    res.status(200).json({
      success: true,
      data: user,
    });
  };
  
  // @desc      User refresh token to get access token
  // @route     POST /api/v1/auth/refresh
  // @access    Private
  const refresh = async (req, res, next) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return next(ErrorCode.INVALID_PARAMETER);
    }
    const user = await jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const accessToken = await jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '3600',
      }
    );
  
    res.status(200).json({
      token: accessToken,
    });
  };


module.exports = {
    registerEmployee,
    login,
    logout,
    getMe,
    refresh,
};
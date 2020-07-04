const User = require('../models/user_role.model');
const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
const _ = require('lodash');
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


  var data = _.pick(user, ['username', 'password', 'full_name', 'phone', 'identity_number', 'address', 'dob', 'role_id', 'nick_name', 'email', 'created_date', 'updated_date']);

  // or blocklist (using lodash)
  var data = _.omit(user, ['_id', '__t', '__v']);

  // only copy object's own properties (without lodash)
  var data = Object.getOwnPropertyNames(user)
    .reduce(function (out, propName) {
      return Object.assign(out, user[propName])
    }, {})

  // create editable copy of object, then remove undesired props
  var data = user.toObject();
  delete data.password;
  res.status(200).json({
    success: true,
    data,
    token,
    refreshToken,
  });
};

// @desc      Register employee
// @route     POST /api/v1/auth/employee/register
// @access    Public
const registerEmployee = async (req, res, next) => {
  const { username, password, email, fullName, nickName, phone, identityNumber, address, dob } = req.body;
  // if (!validateRegisterInput(req.body)) {
  //     return next(ErrorCode.INVALID_PARAMETER);
  // }
  if (username == "" || password == "" || fullName == "" || phone == "" || identityNumber == "" || address == "" || dob == null) {
    return res.status(400).json({
      message: "username or passwork invalid"
    })
  }

  const checkUser = await User.findOne({
    username
  });
  if (checkUser) {
    return next(ErrorCode.EXISTS_INPUT_INFO);
  }

  let data = {
    username,
    password,
    full_name: fullName,
    phone,
    identity_number: identityNumber,
    address,
    dob,
    roleId: 2
  };

  if (nickName != "") {
    data["nick_name"] = nickName;
  }

  if (email != "") {
    data["email"] = email;
  }

  const user = await User.create(data);
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
  const user = await User.findOne({ email }, { _id: 0 });

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
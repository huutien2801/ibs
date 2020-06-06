const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
const User = require('../models/user.model');
const { redisIAMClient } = require('../services/redis.service');

// Protect routes
const protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        // Token invalid
        return res.status(401).json({
            message: 'Invalid token'
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findOne({ user_id: decoded.id });
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const decoded = jwt.verify(token, process.env.JWT_SECRET,{ignoreExpiration: true});
            let refreshToken

            redisIAMClient.get(`RefreshToken:${decoded.id}`,async function(err, valueToken) {
                // reply is null when the key is missing
                if(valueToken == null){
                    return next(ErrorCode.TOKEN_EXPIRED);
                }
                refreshToken = valueToken
                const decodedFromRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await User.findOne({ user_id: decodedFromRefreshToken.id });
                const accessToken = await jwt.sign(
                    {
                        id: user.user_id,
                        username: user.username,
                        email: user.email
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '3600'
                    }
                );
                req.user = user;
                next();
              });
        }
        else return next(ErrorCode.REQUEST_TIMEOUT);
    }
};

// Grant access to specific roles
const authorize = requiredRole => {
    return (req, res, next) => {
        if (req.user.role_id !== requiredRole) {
            return next(ErrorCode.REQUEST_TIMEOUT);
        }
        next();
    };
};

module.exports = {
    protect,
    authorize
};

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const UserSchema = mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    account_number: {
        type: String,
        required: true,
        unique: true
    },
    pin: {
        type: String,
        required: true
    },
    balance: {
        type: double,
        default: 0
    },
    register_date: {
        type: Date,
        default: Date.now
    },
    expired_date: {
        type: Date,
        default: Date.now
    },
    ratio_id: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        required: true
    },
    deposit_date: {
        type: Date,
        default: Date.now
    },
    redeem: {
        type: Number,
        required: true
    },
    redeem_date: {
        type: Date,
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
});

UserSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({
        id: this.user_id,
        username: this.username,
        email: this.email
    }, process.env.JWT_SECRET, {
        expiresIn: '30'
    });
};

UserSchema.methods.getRefreshToken = function () {
    return jwt.sign({
        id: this.user_id,
        username: this.username,
        email: this.email
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '2592000'
    });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
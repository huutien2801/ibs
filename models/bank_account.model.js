const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const BankAccountSchema = mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    //STANDARD, DEPOSIT
    type: {
        type: String,
        required: true
    },
    account_number: {
        type: String,
        required: true,
        unique: true
    },
    pin: {
        type: Number
    },
    balance: {
        type: Number,
        default: 0
    },
    register_date: {
        type: Date,
        default: Date.now
    },
    expired_date: {
        type: Date
    },
    ratio_id: {
        type: Number
    },
    deposit: {
        type: Number
    },
    deposit_date: {
        type: Date,
    },
    redeem: {
        type: Number
    },
    redeem_date: {
        type: Date,
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
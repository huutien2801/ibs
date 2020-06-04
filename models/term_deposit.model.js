const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const TermDepositSchema = mongoose.Schema({
    term_deposit_id:{
        type:Number,
        required: true
    },
    user_id: {
        type: Number,
        required: true
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
    }
});

module.exports = mongoose.model('TermDeposit', TermDepositSchema);
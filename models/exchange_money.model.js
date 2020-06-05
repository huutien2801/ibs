const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const ExchangeMoneySchema = mongoose.Schema({
    exchange_money_id:{
        type:Number,
        required: true
    },
    partner_code: {
        type: String,
    },
    sender_id: {
        type: Number,
        required: true
    },
    sender_username: {
        type: String,
        required: true
    },
    receiver_id: {
        type: Number,
        required: true
    },
    receiver_username: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        required: true
    },
    message: {
        type: String,
    },
    fee_type: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        required: true
    },
    send_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExchangeMoney', ExchangeMoneySchema);
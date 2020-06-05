const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const ExchangeMoneySchema = mongoose.Schema({
    exchange_user_id:{
        type:Number,
        required: true
    },
    sender_id: {
        type:Number,
        required: true
    },
    receiver_id: {
        type:Number,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ExchangeMoney', ExchangeMoneySchema);
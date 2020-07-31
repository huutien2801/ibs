const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const ExchangeMoneySchema = mongoose.Schema({
    exchange_money_id:{
        type:Number,
    },
    partner_code: {
        type: String,
    },
    sender_id: {
        type: Number,
        required: true
    },
    receiver_id: {
        type: Number,
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
        type: String,
        required: true
    },
    is_inside: {
        type: Boolean,
        required: true,
    },
    receiver_account_number: {
        type: String,
        required: true,
    },
    sender_account_number: {
        type: String,
        required: true,
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

ExchangeMoneySchema.plugin(AutoIncrement, { inc_field: 'exchange_money_id' });

module.exports = mongoose.model('ExchangeMoney', ExchangeMoneySchema);
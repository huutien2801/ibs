const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const ExchangeUserSchema = mongoose.Schema({
    exchange_user_id:{
        type:Number,
    },
    sender_account_number: {
        type:Number,
        required: true
    },
    sender_full_name: {
        type:String,
        required: true
    },
    receiver_account_number: {
        type:Number,
        required: true
    },
    receiver_full_name: {
        type:String,
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

ExchangeUserSchema.plugin(AutoIncrement, { inc_field: 'exchange_user_id' });

module.exports = mongoose.model('ExchangeUser', ExchangeUserSchema);
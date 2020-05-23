const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const BankAccountSchema = mongoose.Schema({
    bank_account_type:{
        type:Number,
        require: true
    },
    bank_account_id:{
        type: Number,
        require: true
    },
    balance:{
        type:Number,
        require: true
    },
    user_id:{
        type:Number,
        require: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('BankAccount', BankAccountSchema);
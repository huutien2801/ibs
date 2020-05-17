const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const BankAccountSchema = mongoose.Schema({
    bank_account_id: {
        type: Number,
    },
    bank_account_type:{
        type:Number,
    },
    balance:{
        type:Number,
    },
    user_id:{
        type:Number,
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

BankAccountSchema.plugin(AutoIncrement, { inc_field: 'bank_account_id' });
module.exports = mongoose.model('BankAccount', BankAccountSchema);
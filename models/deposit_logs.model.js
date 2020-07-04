const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const DepositLogsSchema = mongoose.Schema({
    deposit_logs_id:{
        type:Number,
    },
    receiver_account_number: {
        type: String,
    },
    receiver_username: {
        type: String,
    },
    money: {
        type: Number,
        required: true
    },
    deposit_date: {
        type: Date,
        default: Date.now
    },
});

DepositLogsSchema.plugin(AutoIncrement, { inc_field: 'deposit_logs_id' });

module.exports = mongoose.model('DepositLogs', DepositLogsSchema);
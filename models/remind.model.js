const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const RemindSchema = mongoose.Schema({
    remind_id:{
        type:Number,
        required: true
    },
    reminder_account_number:{
        type:Number,
        required: true
    },
    reminded_account_number:{
        type:Number,
        required: true
    },
    message:{
        type:String
    },
    debt:{
        type:Number,
        required: true
    },
    status:{
        type:Number,
        default: 1
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Remind', RemindSchema);
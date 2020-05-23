const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});



const PartnerLogsSchema = mongoose.Schema({
    partner_code: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    request_type: {
        type: String,
        required: true
    },
    request_time:{
        type: Number,
        required: true
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

// PartnerSchema.plugin(AutoIncrement, { inc_field: 'partner_id' });
module.exports = mongoose.model('PartnerLog', PartnerLogsSchema);

const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const PartnerSchema = mongoose.Schema({
    partner_code: {
        type: String,
        required: true
    },
    partner_name: {
        type: String,
    },
    partner_public_key: {
        type: String,
        required: true
    },
    partner_secret_key: {
        type: String,
        required: true
    },
    encrypt_type:{
        type: String,
        required: true
    },
    passphrase:{
        type: String,
        required: true,
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
module.exports = mongoose.model('Partner', PartnerSchema);
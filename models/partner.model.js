const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const PartnerSchema = mongoose.Schema({
    partner_id: {
        type: Number,
    },
    partnerCode: {
        type: String,
        required: true
    },
    partnerName: {
        type: String,
        required: true
    },
    partnerPublicKey: {
        type: String,
        required: true
    },
    partnerSecretKey: {
        type: String,
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

PartnerSchema.plugin(AutoIncrement, { inc_field: 'partner_id' });
module.exports = mongoose.model('Partner', PartnerSchema);
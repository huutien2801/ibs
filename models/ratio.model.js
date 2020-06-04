const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const RatioSchema = mongoose.Schema({
    ratio_id:{
        type:Number,
        required: true
    },
    months: {
        type: Number,
        required: true
    },
    ratio: {
        type: Float32Array,
        required: true
    },
    updated_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ratio', RatioSchema);
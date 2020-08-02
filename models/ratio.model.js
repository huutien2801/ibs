const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const RatioSchema = mongoose.Schema({
    ratio_id:{
        type:Number,
    },
    month: {
        type: Number,
        required: true,
        unique: true,
    },
    ratio: {
        type: Number,
        required: true
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

RatioSchema.plugin(AutoIncrement, { inc_field: 'ratio_id' });

module.exports = mongoose.model('Ratio', RatioSchema);
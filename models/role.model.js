const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const RoleSchema = mongoose.Schema({
    role_id:{
        type:Number,
        required: true
    },
    role_name: {
        type: String,
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

RoleSchema.plugin(AutoIncrement, { inc_field: 'role_id' });

module.exports = mongoose.model('Role', RoleSchema);
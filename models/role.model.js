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
});

module.exports = mongoose.model('Role', RoleSchema);
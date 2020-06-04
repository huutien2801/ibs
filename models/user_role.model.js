const mongoose = require('mongoose');
require('dotenv').config({
    path: 'config/config.env'
});

const UserRoleSchema = mongoose.Schema({
    user_role_id:{
        type:Number,
        required: true
    },
    user_id: {
        type: Number,
        required: true
    },
    role_id: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('UserRole', UserRoleSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config({
    path: 'config/config.env'
});

const UserRoleSchema = mongoose.Schema({
    user_id: {
        type: Number,
    },
    role_code: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        maxlength: 255,
        required: true
    },
    full_name:{
        type: String,
        required: true
    },
    nick_name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    gender: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    identity_number: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true,
        default: false
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

UserRoleSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

UserRoleSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// UserRoleSchema.pre('updateOne', async function (next) {
//     const data = this.getUpdate()

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(data.password, salt);
// });

// Sign JWT and return
UserRoleSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({
        id: this.user_id,
        username: this.username,
        email: this.email
    }, process.env.JWT_SECRET, {
        expiresIn: '30'
    });
};

UserRoleSchema.methods.getRefreshToken = function () {
    return jwt.sign({
        id: this.user_id,
        username: this.username,
        email: this.email
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '2592000'
    });
};

UserRoleSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('UserRole', UserRoleSchema);
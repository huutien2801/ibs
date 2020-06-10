const OTPDB = require('../models/otp.model');
const UserRoleDB = require('../models/user_role.model');

const {generateOTP, sendOTPMail} = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

//API create partner
const createOTPMail = async(req, res, next) => {
    let user = await UserRoleDB.find({user_id:req.user.user_id});
    if(user == null){
        return res.status(400).json({
            message: "ERROR. Can't get user."
        })
    }

    const otpCode = generateOTP();

    let resp = sendOTPMail(user.email, user.full_name, otpCode)
    let otp = OTPDB.create({
        email: user.email,
        otp: otpCode
    })

    if (resp.status == "OK" && otp != null) {
        return res.status(200).json({
            message: resp.message
        })
    }

    return res.status(400).json({
        message: resp.message
    })
}

const confirmOTP = async(req, res, next) => {
    const {OTP} = req.body;

    let user = await UserRoleDB.find({user_id:req.user.user_id});
    if(user == null){
        return res.status(400).json({
            message: "ERROR. Can't get user."
        })
    }

    let otp = await OTPDB.find({email: user.email}).limit(1).sort({createdAt:-1})

    if (otp == OTP){
        return res.status(200).json({
            status: "OK",
            message: "OTP match."
        })
    }

    return res.status(400).json({
        status: "ERROR",
        message: "OTP did't match"
    })
}

module.exports = {
    createOTPMail,
    confirmOTP
};
    
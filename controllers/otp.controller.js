const OTPDB = require('../models/otp.model');
const UserRoleDB = require('../models/user_role.model');

const {generateOTP, sendOTPMail} = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

//API create partner
const createOTPMail = async(req, res, next) => {
    const { email } = req.query
    filter = {}
    if (email){
        filter['email'] = email
    }
    if (req.user){
        filter['user_id'] = req.user.user_id
    }
 
    let user = await UserRoleDB.findOne(filter);
    if(!user){
        return res.status(400).json({
            message: "ERROR. Can't get user."
        })
    }

    const otpCode = generateOTP();

    let resp = await sendOTPMail(user.email, user.full_name, otpCode)
    if (resp.status == "OK") {
        await OTPDB.create({
            email: user.email,
            otp: otpCode
        })
        return res.status(200).json({
            message: resp.message
        })
    }

    return res.status(400).json({
        message: resp.message
    })
}

const confirmOTP = async(req, res, next) => {
    const {email, OTP} = req.body;
    filter = {}
    if (email){
        filter['email'] = email;
    } else {
        let user = await UserRoleDB.findOne({user_id: req.user.user_id});
        if(!user){
            return res.status(400).json({
                message: "ERROR. Can't get user."
            })
        }
        filter['email'] = user.email;
    }

    let otp = await OTPDB.find(filter).limit(1).sort({createdAt:-1})
    if (!otp){
        return res.status(400).json({
            status: "ERROR",
            message: "Your OTP code is expired."
        })
    }
    if (otp[0].otp == OTP){
        let confirmUser = UserRoleDB.findOne({email: email});
        if (!confirmUser.is_active)
        {
            let updateUser = await UserRoleDB.findOneAndUpdate({email: email}, {is_active: true});
            if (!updateUser)
            {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Can't active your account"
                })
            }
        }
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
    
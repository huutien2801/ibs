const User = require('../models/user_role.model');
const BankAccount = require('../models/bank_account.model');
const Partner = require('../models/partner.model');
const PartnerLog = require("../models/partner_logs.model")
const UserRole = require('../models/user_role.model');
const ExchangeMoney = require('../models/exchange_money.model');
const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
const md5 = require('md5');
const NodeRSA = require('node-rsa');
const openpgp = require('openpgp');
const { FEE_TRANSFER_BANK } = require('../utils/util');
let requestTypeEnum = {
    GET_USER_INFO: "GET_USER_INFO",
    CHANGE_BALANCE: "CHANGE_BALANCE"
}
require('dotenv').config({
    path: './config/config.env',
});

//Expose two API for others bank

//API get info account on service
const getInfoUser = async (req, res, next) => {

    //If parnertCode is invalid
    let partner_code = req.headers.partnercode
    if (!partner_code) {
        return res.status(ErrorCode.INVALID_PARAMETER.code).json({
            message: ErrorCode.INVALID_PARAMETER.message
        });
    }
    //Call to DB to check partner 
    let partner = await Partner.findOne({ partner_code });
    if (!partner) {
        return res.status(400).json({
            message: "Your bank is not my partner. Please contact to my bank and call API later"
        });
    }

    if (!req.headers.ts) {
        return res.status(400).json({
            message: 'Lack of time request'
        });
    }
    let secondRequestedDate = req.headers.ts

    let currentDate = new Date()
    let secondCurrentDate = currentDate.getTime()
    // //If Requested date is greater than current date
    // //Return false
    // //Else we'll check if delta time between requested date and current date is less 60 seconds.
    // //Your request will be approved
    if (secondRequestedDate > secondCurrentDate) {
        return res.status(400).json({
            message: 'Your request time is greater than current time'
        });
    } else {
        if (Math.abs(secondCurrentDate - secondRequestedDate) > 600000) {
            return res.status(500).json({
                message: 'Request time out'
            });
        }
    }

    //Call to DB to get info username
    let accountNumber = req.query.accountNumber
    let account = await BankAccount.findOne({ account_number: accountNumber })

    if (!account) {
        return res.status(404).json({
            message: "Invalid account",
            status: 404
        });
    }

    let user = await UserRole.findOne({ user_id: account.user_id }).select({ 'password': 0 });

    if (user) {

        let bodyPartnerLog = {
            partner_code: partner_code,
            method: "GET",
            request_type: requestTypeEnum.GET_USER_INFO,
            request_time: secondRequestedDate
        }
        await PartnerLog.create(bodyPartnerLog)
        return res.status(200).json({
            data: {
                account_number: accountNumber,
                full_name: user.full_name
            },
            message: "Get info account succeed."
        });
    }

    return res.status(400).json({
        message: "Can't get user"
    })
}

//API Recharging money in account from others bank
const rechargeMoneyInAccount = async (req, res, next) => {

    //If parnertCode is invalid
    let partner_code = req.headers.partnercode
    //Call to DB to check partner 
    if (!partner_code) {
        return res.status(ErrorCode.INVALID_PARAMETER.code).json({
            message: ErrorCode.INVALID_PARAMETER.message
        });
    }

    let partner = await Partner.findOne({ partner_code });
    if (!partner) {
        return res.status(400).json({
            message: "Your bank is not my partner. Please connect to my bank and call API later",
            status: 400
        });
    }

    if (!req.headers.ts) {
        return res.status(400).json({
            message: 'Lack of time request'
        });
    }

    //Convert date into secs to compare
    let secondRequestedDate = req.headers.ts

    let currentDate = new Date()
    let secondCurrentDate = currentDate.getTime()

    //If Requested date is greater than current date
    //Return false
    //Else we'll check if delta time between requested date and current date is less 60 seconds.
    //Your request will be approved
    if (secondRequestedDate > secondCurrentDate) {
        return res.status(400).json({
            message: 'Your request time is greater than current time'
        });
    } else {
        if (Math.abs(secondCurrentDate - secondRequestedDate) > 600000) {
            return res.status(500).json({
                message: 'Request time out'
            });
        }
    }

    let partnerLog = await PartnerLog.findOne({
        request_time: secondRequestedDate,
        partner_code: partner_code,
        method: "POST"
    })

    //Check if request to change balance existed. Return error.
    if (partnerLog) {
        return res.status(400).json({
            message: 'Your request existed.',
            status: 400
        });
    }

    //If your request is updated
    //Compare partner sign on header
    if (!req.headers.hashedsign) {
        return res.status(400).json({
            message: 'Lack of your signature. Please fill it into header'
        });
    }

    let secretKey = partner.partner_secret_key
    let hashSecretKey = md5(secretKey)
    let body = req.body
    let hashStr = md5(body + secondRequestedDate + hashSecretKey)
    if (hashStr !== req.headers.hashedsign) {
        return res.status(400).json({
            message: 'Your request is updated by someone'
        });
    }

    //Get sign from header
    let sign = req.headers.sign
    let isSuccess
    if (partner.encrypt_type == "RSA") {
        const keyPublic = new NodeRSA(partner.partner_public_key)
        // const keyPublic = new NodeRSA(process.env.RSA_PUBLIC_KEY)
        isSuccess = keyPublic.verify(body, sign, "base64", "base64")
    } else {
        const verified = await openpgp.verify({
            message: await openpgp.cleartext.readArmored(sign),           // parse armored message
            publicKeys: (await openpgp.key.readArmored(partner.partner_public_key)).keys // for verification
        })
        isSuccess = verified.signatures[0]
        if (!isSuccess) {
            return res.status(400).json({
                message: "Verify your signature failed.",
                status: 400
            });
        }
    }

    //Verify success
    if (isSuccess == true) {

        //Call to DB to update money
        if (!body.accountNumber || !body.cost) {
            return res.status(400).json({
                message: "Invalid body."
            });
        }

        let account = await BankAccount.findOne({ account_number: body.accountNumber })
        if (!account) {
            return res.status(404).json({
                message: "Your account is incorrect",
                status: 404
            });
        }
        let fee = 0;
        if (body.feeType == "NOT_PAY")
        {
            fee = FEE_TRANSFER_BANK;
        }
        let newBalance = account.balance + body.cost - fee
        const filter = { account_number: body.accountNumber };
        const update = { balance: newBalance };
        let resp = await BankAccount.findOneAndUpdate(filter, update);
        if (resp) {
            let now = new Date();
            let currentUserRole = await UserRole.findOne({user_id: account.user_id})
            let partner = await Partner.findOne({partner_code});
            let autoMessage = "Ngân hàng" +  partner.partner_name +  "STK" + body.accountNumber +  body.sendAccountName + "đã chuyển khoản cho bạn"
            await ExchangeMoney.create({
                partner_code,
                money: body.cost,
                message: autoMessage,
                fee_type: body.feeType,
                is_inside: false,
                receiver_account_number: body.accountNumber,
                sender_account_number: body.sendAccountNumber,
                receiver_full_name: currentUserRole.full_name,
                sender_full_name: body.sendAccountName,
                sign,
                created_time_second: now.getTime()
            })

            const keyPrivate = new NodeRSA(process.env.RSA_PRIVATE_KEY)

            let bodyReturn = {
                accountNumber: body.accountNumber,
                balance: body.cost,
                status: "SUCCESS"
            }
            let returnSign = keyPrivate.sign(bodyReturn, "base64", "base64");

            //Write log to DB
            let bodyPartnerLog = {
                partner_code: partner_code,
                method: "POST",
                request_type: requestTypeEnum.CHANGE_BALANCE,
                request_time: secondRequestedDate
            }
            await PartnerLog.create(bodyPartnerLog)

            return res.status(200).json({
                message: "Updated your balance succeed.",
                status: 200,
                sign: returnSign
            });
        }
        return res.status(400).json({
            message: "Can't update balance at this time.",
            status: 400
        });
    }
    return res.status(400).json({
        message: 'Verify your signature failed.',
        status: 400
    });
}



module.exports = {
    getInfoUser,
    rechargeMoneyInAccount,
};


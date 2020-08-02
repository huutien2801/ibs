const ExchangeUser = require('../models/exchange_user.model');
const BankAccount = require('../models/bank_account.model');
const UserRole = require('../models/user_role.model');
const md5 = require('md5');
const axios = require('axios');
require('dotenv').config({
    path: './config/config.env',
});

async function getClientInfo(partnerCode, accountNumber) {
    let name = ''
    switch (partnerCode) {
        case "SAPHASANBank":
            name = await getSAPPHASANBANKInfo(accountNumber)
            break;
        default:
            break;
    }
    return name
}

async function getSAPPHASANBANKInfo(accountNumber) {
    let ts = Date.now();
    let data = {
        accountNumber: accountNumber
    }
    let hashStr = md5(ts + data + md5("dungnoiaihet"));
    let name = ''
    let resp = await axios({
        method: 'post',
        url: 'https://qlbank1.herokuapp.com/api/external/customer',
        data,
        headers: {
            ts,
            partnerCode: "3TBank",
            hashedSign: hashStr,
        }
    })
    if(resp && !resp.error){
        name = resp.data.name
    }
    return name
}

const addUserToList = async (req, res, next) => {
    const { receiverAccountNumber, nickName, isInside, partnerCode } = req.body

    //Get info of sender
    let senderBankAccount = await BankAccount.findOne({ user_id: req.user.user_id })
    let senderUserRole = await UserRole.findOne({ user_id: req.user.user_id })

    //Create Obj
    let createObj = {}
    createObj["sender_account_number"] = senderBankAccount.account_number
    createObj["receiver_account_number"] = receiverAccountNumber
    let isExisted = await ExchangeUser.findOne(createObj)
    if(isExisted){
        return res.status(404).json({
            message: `You have added receiver ${receiverAccountNumber}`
        })
    }

    createObj["sender_full_name"] = senderUserRole.full_name
    createObj["is_inside"] = isInside

    if(isInside == true){
        let receiverBankAccount = await BankAccount.findOne({ account_number: receiverAccountNumber })
        let receiverUserRole = await UserRole.findOne({ user_id: receiverBankAccount.user_id })
        if (nickName) {
            createObj["receiver_nick_name"] = nickName;
        }
        else {
            createObj["receiver_nick_name"] = receiverUserRole.full_name
        }
        createObj["receiver_full_name"] = receiverUserRole.full_name
    }else{
        if (nickName) {
            createObj["receiver_nick_name"] = nickName;
            createObj["receiver_full_name"] = nickName
        }
        else {
            let name = await getClientInfo(partnerCode,receiverAccountNumber)
            if(name == ''){
                return res.status(400).json({
                    message: "My partner system has error !",
                    errorCode:"PARTNER_ERROR"
                })
            }
            createObj["receiver_nick_name"] = name
            createObj["receiver_full_name"] = name
        }
        createObj["partner_code"] = partnerCode
    }

    let resp = await ExchangeUser.create(createObj);
    if (resp) {
        return res.status(200).json({
            message: "Saved successfully",
        })
    }else {
        return res.status(400).json({
            message: "Can't save to your list"
        })
    }
};

const showList = async (req, res, next) => {
    let currentUserBankAccount = await BankAccount.findOne({ user_id: req.user.user_id });
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    let q = JSON.parse(req.query.q);
    let filterReceiver = {}
    try {

        filterReceiver['sender_account_number'] = currentUserBankAccount.account_number
        if (q.isInside != undefined || q.isInside != null) {
            filterReceiver['is_inside'] = q.isInside
        }

        if (q.partnerCode) {
            filterReceiver['partner_code'] = q.partnerCode
        }

        let total = await ExchangeUser.count(filterReceiver);
        ExchangeUser.find(filterReceiver, function (err, users) {
            if (users.length) {
                return res.status(200).json({
                    users,
                    total
                })
            }
            else {
                return res.status(400).json({
                    message: "Empty list"
                })
            }
        }).limit(limit ? limit : 20)
            .skip(skip ? skip : 0);
    } catch (error) {
        return res.status(400).json({
            message: "Sys has error",
            errorCode: error
        })
    }

};



module.exports = {
    addUserToList,
    showList,
};
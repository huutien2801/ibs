const ExchangeUser = require('../models/exchange_user.model');
const BankAccount = require('../models/bank_account.model');
const UserRole = require('../models/user_role.model');


require('dotenv').config({
    path: './config/config.env',
});

const addUserToList = async(req, res, next) => {
    const { receiverAccountNumber, nickName, isInside, partnerCode } = req.body
    let senderBankAccount = await BankAccount.findOne({user_id: req.user.user_id})
    let senderUserRole = await UserRole.findOne({user_id: req.user.user_id})
    let receiverBankAccount = await BankAccount.findOne({account_number: receiverAccountNumber})
    let receiverUserRole = await UserRole.findOne({user_id: receiverBankAccount.user_id})
    let filter = {}
    filter["receiver_account_number"] = receiverAccountNumber
    if (nickName)
    {
        filter["receiver_nick_name"] = nickName;
    }
    else {
        filter["receiver_nick_name"] = receiverUserRole.full_name
    }
    filter["is_inside"] = isInside;
    if (!isInside)
    {
        if (bankName)
        {
            filter["partner_code"] = partnerCode
        }
    }

    filter["sender_account_number"] = senderBankAccount.account_number
    filter["sender_full_name"] = senderUserRole.full_name
    filter["receiver_full_name"] = receiverUserRole.full_name
    let resp = await ExchangeUser.create(filter);
    if (resp) {
        return res.status(200).json({
            message: "Saved successfully",
        })
    }
    else {
        return res.status(400).json({
            message: "Can't save to your list"
        })
    }
};

const showList = async(req, res, next) => {
    let currentUserBankAccount = await BankAccount.findOne({ user_id: req.user.user_id });
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    let q = JSON.parse(req.query.q);
    let filterReceiver = {}
    try {
        
        filterReceiver['sender_account_number'] = currentUserBankAccount.account_number
        if(q.isInside != undefined || q.isInside != null){
            filterReceiver['is_inside'] = q.isInside
        }

        if(q.partnerCode){
            filterReceiver['partner_code'] = q.partnerCode
        }

        let total = await ExchangeUser.count(filterReceiver);
        ExchangeUser.find(filterReceiver, function(err, users) {
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
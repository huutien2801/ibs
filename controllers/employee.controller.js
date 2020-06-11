const DepositLogs = require('../models/deposit_logs.model')
const BankAccount = require('../models/bank_account.model')
const UserRole = require('../models/user_role.model')
const ExchangeMoney = require('../models/exchange_money.model');
const Remind = require('../models/remind.model');
const {EXCHANGE_TYPE_ALL, EXCHANGE_TYPE_SEND, EXCHANGE_TYPE_RECEIVE, EXCHANGE_TYPE_DEBT} = require('../utils/util')


require('dotenv').config({
    path: './config/config.env',
});

const depositMoney = async(req, res, next) => {
    const {accountNumber, username, money} = req.body;
    if (accountNumber != null && username == null)
    {
        const curUser = await BankAccount.findOne({ account_number: accountNumber});
        let curUsername = await UserRole.findOne({ user_id: curUser.user_id}).username;
        let resp1 = await DepositLogs.create({ 
            receiver_account_number: accountNumber,
            receiver_username: curUsername,
            money: money
        });
        let resp2 = await BankAccount.findOneAndUpdate({ account_number: accountNumber}, {balance: curUser.balance + money});
        if (resp1 && resp2)
        {
            return res.status(200).json({
                message: "Deposit money success"
            })
        }
        else {
            return res.status(400).json({
                message: "Deposit money fail"
            })
        }
    }
    else {
        if (accountNumber == null && username != null)
        {
            const curUser = await UserRole.findOne({ username: username});
            let curBankAccount = await BankAccount.findOne({ user_id: curUser.user_id});
            let curAccountNumber = curBankAccount.account_number;
            let curBalance = curBankAccount.balance;
            let newBalance = money + curBalance;
            let resp1 = await DepositLogs.create({ 
                receiver_account_number: curAccountNumber,
                receiver_username: username,
                money: money
            });
            let resp2 = await BankAccount.findOneAndUpdate({ account_number: curAccountNumber}, {balance: newBalance});
            if (resp1 && resp2)
            {
                return res.status(200).json({
                    message: "Deposit money success"
                })
            }
            else {
                return res.status(400).json({
                    message: "Deposit money fail"
                })
            }
        }
        else
        {
            return res.status(400).json({
                message: "Can't find your account"
            });
        }
    }
}

const getUserLogs = async (req, res, next) => {
    const accountNumber = "119";
    const type = EXCHANGE_TYPE_DEBT;
    let user = await BankAccount.findOne({ account_number: accountNumber});

    if (type == EXCHANGE_TYPE_ALL)
    {
        let resp1 = await ExchangeMoney.find({ $or: [ {'sender_id': user.user_id}, {'receiver_id': user.user_id} ]});
        let resp2 = await Remind.find({ status: "DONE", $or:[ {'reminder_account_number': accountNumber}, {'reminded_account_number': accountNumber} ]});
        if (resp1.length || resp2.length)
        {
            return res.status(200).json({
                data1: resp1,
                data2: resp2
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }

    if (type == EXCHANGE_TYPE_SEND)
    {
        let resp = await ExchangeMoney.find({ 'sender_id': user.user_id });
        if (resp.length)
        {
            return res.status(200).json({
                data: resp,
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }

    if (type == EXCHANGE_TYPE_RECEIVE)
    {
        let resp = await ExchangeMoney.find({ 'receiver_id': user.user_id });
        if (resp.length)
        {
            return res.status(200).json({
                data: resp,
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }

    if (type == EXCHANGE_TYPE_DEBT)
    {
        let resp = await Remind.find({ status: "DONE", $or:[ {'reminder_account_number': accountNumber}, {'reminded_account_number': accountNumber} ]});
        if (resp.length)
        {
            return res.status(200).json({
                data: resp,
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }
}

module.exports = {
    depositMoney,
    getUserLogs
};
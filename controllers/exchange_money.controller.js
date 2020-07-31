const ExchangeMoneyDB = require('../models/exchange_money.model')
const BankAccount = require('../models/bank_account.model')
const UserRole = require('../models/user_role.model')
const Remind = require('../models/remind.model');
const { EXCHANGE_TYPE_ALL, EXCHANGE_TYPE_SEND, EXCHANGE_TYPE_RECEIVE, EXCHANGE_TYPE_DEBT } = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

//Lấy lịch sử thanh toán GET
//Truyền query q={userId}
const getAllById = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    let startDate = req.query.start;
    let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);

    let data = {};
    if (startDate && endDate) {
        data = {
            $where: function () {
                return this.updated_date > startDate && this.updated_date < endDate;
            },
        };
    }
    
    let totalSender = await ExchangeMoneyDB.count({
        sender_id: q.userId, data
    });
    let totalRec = await ExchangeMoneyDB.count({
        receiver_id: q.userId, data
    });

    let respSender = await ExchangeMoneyDB.find({ sender_id: q.userId, data }).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    let respRec = await ExchangeMoneyDB.find({ receiver_id: q.userId, data }).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    

    if (respSender && respRec) {
        data["sender"] = respSender;
        data["receive"] = respRec;
        return res.status(200).json({
            message: "Get all history sender successfully",
            data: data,
            total: totalSender + totalRec
        })
    }

    return res.status(400).json({
        message: "Can't get history sender at this time."
    })
}


const depositMoney = async (req, res, next) => {
    const { accountNumber, username, money, feeType, message } = req.body;
    if (accountNumber != null) {
        const curUser = await BankAccount.findOne({ account_number: accountNumber });
        let resp1 = await ExchangeMoneyDB.create({
            sender_id: curUser.user_id,
            receiver_id: curUser.user_id,
            money: money,
            fee_type: feeType
        });
        let resp2 = await BankAccount.findOneAndUpdate({ account_number: accountNumber }, { balance: curUser.balance + money });
        if (resp1 && resp2) {
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
        if (username != null) {
            const curUser = await UserRole.findOne({ username: username });
            let curBankAccount = await BankAccount.findOne({ user_id: curUser.user_id });
            let curAccountNumber = curBankAccount.account_number;
            let curBalance = curBankAccount.balance;
            let newBalance = money + curBalance;
            let resp1 = await ExchangeMoneyDB.create({
                sender_id: curUser.user_id,
                receiver_id: curUser.user_id,
                money: money,
                fee_type: feeType
            });
            let resp2 = await BankAccount.findOneAndUpdate({ account_number: curAccountNumber }, { balance: newBalance });
            if (resp1 && resp2) {
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
            return res.status(400).json({
                message: "Can't find your account"
            });
        }
    }
}

const getUserLogs = async (req, res, next) => {
    const accountNumber = req.query.account_number
    const type = EXCHANGE_TYPE_DEBT;
    let startDate = req.query.start;
    let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);

    let data = {};
    if (startDate && endDate) {
        data = {
            $where: function () {
                return this.updated_date > startDate && this.updated_date < endDate;
            },
        };
    }
    let user = await BankAccount.findOne({ account_number: accountNumber });

    if (type == EXCHANGE_TYPE_ALL) {
        let totalExchange = await ExchangeMoneyDB.count({
            $or: [{ 'sender_id': user.user_id }, { 'receiver_id': user.user_id }], data
        });
        let totalRemind = await RemindDB.count({
            data, status: "DONE", $or: [{ 'reminder_account_number': accountNumber }, { 'reminded_account_number': accountNumber }]
        });
        let resp1 = await ExchangeMoney.find({ $or: [{ 'sender_id': user.user_id }, { 'receiver_id': user.user_id }], data }).limit(limit ? limit : 20)
            .skip(skip ? skip : 0);
        let resp2 = await Remind.find({ data, status: "DONE", $or: [{ 'reminder_account_number': accountNumber }, { 'reminded_account_number': accountNumber }] }).limit(limit ? limit : 20)
            .skip(skip ? skip : 0);
        if (resp1.length || resp2.length) {
            return res.status(200).json({
                data1: resp1,
                data2: resp2,
                total: totalExchange + totalRemind
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }

    if (type == EXCHANGE_TYPE_SEND) {
        let total = await RemindDB.count({
            data, 'sender_id': user.user_id
        });
        let resp = await ExchangeMoney.find({ data, 'sender_id': user.user_id }).limit(limit ? limit : 20)
            .skip(skip ? skip : 0);
        if (resp.length) {
            return res.status(200).json({
                data: resp,
                total
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }

    if (type == EXCHANGE_TYPE_RECEIVE) {
        let total = await RemindDB.count({
            data, 'receiver_id': user.user_id
        });
        let resp = await ExchangeMoney.find({ data, 'receiver_id': user.user_id }).limit(limit ? limit : 20)
            .skip(skip ? skip : 0);
        if (resp.length) {
            return res.status(200).json({
                data: resp,
                total
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }

    if (type == EXCHANGE_TYPE_DEBT) {
        let total = await RemindDB.count({
            data, status: "DONE", $or: [{ 'reminder_account_number': accountNumber }, { 'reminded_account_number': accountNumber }]
        });
        let resp = await Remind.find({ data, status: "DONE", $or: [{ 'reminder_account_number': accountNumber }, { 'reminded_account_number': accountNumber }] }).limit(limit ? limit : 20)
            .skip(skip ? skip : 0);
        if (resp.length) {
            return res.status(200).json({
                data: resp,
                total
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }
}
//Xem danh sách giao dịch trong tháng với các ngân hàng khác (đối soát)
//API get history for admin
//filter by partnerCode, time
//get total money exchange in time
//GET param q={"partnerCode":...},start:time,end:time,limit,skip,getTotal=true
const getAllHistoryAdmin = async (req, res, next) => {
    let q = req.query.q;
    let startDate = req.query.start;
    let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    let getTotal = req.query.total;

    let data = {};
    if (startDate && endDate) {
        data = {
            $where: function () {
                return this.updated_date > startDate && this.updated_date < endDate;
            },
        };
    }

    if (getTotal) {
        data.partner_code = { $type: "string" };
    } else {
        data.partner_code = q.partnerCode;
    }

    data.total = { $sum: "$money" };

    let resp = await ExchangeMoneyDB.find(data)
        .limit(limit ? limit : 20)
        .skip(skip ? skip : 0);

    if (resp) {
        return res.status(200).json({
            message: "Query history successful",
            data: resp,
        });
    }

    return res.status(400).json({
        message: "Can't get history at this time.",
    });
};

module.exports = {
    getAllById,
    depositMoney,
    getUserLogs,
    getAllHistoryAdmin
};
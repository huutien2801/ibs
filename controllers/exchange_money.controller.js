const ExchangeMoneyDB = require('../models/exchange_money.model')
const BankAccount = require('../models/bank_account.model')
const UserRole = require('../models/user_role.model')
const Remind = require('../models/remind.model');
const { EXCHANGE_TYPE_ALL, EXCHANGE_TYPE_SEND, EXCHANGE_TYPE_RECEIVE, EXCHANGE_TYPE_DEBT } = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

//Lấy lịch sử thanh toán GET
//Truyền query q={acountNumber, isInside}
const getAllById = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    // let startDate = req.query.start;
    // let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
   
    let filterSender = {}
    let filterRec = {}
    if (q.start && q.end) {
        let startDate = Date.parse(q.start);
        let endDate = Date.parse(q.end);
        filterRec = {
            created_time_second: {$gt: startDate, $lt: endDate}
        }
        filterSender = {
            created_time_second: {$gt: startDate, $lt: endDate}
        }
    }

    if (q.accountNumber){
        filterSender['sender_account_number'] = q.accountNumber
        filterRec['receiver_account_number'] = q.accountNumber
    } else {
        filterSender['sender_id'] = req.user.user_id
        filterRec['receiver_id'] = req.user.user_id
    }
    if (q.isInside){
        filterSender['is_inside'] = q.isInside
        filterRec['is_inside'] = q.isInside
    }
    
    let totalSender = await ExchangeMoneyDB.count(filterSender);
    let totalRec = await ExchangeMoneyDB.count(filterRec);

    let respSender = await ExchangeMoneyDB.find(filterSender).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    let respRec = await ExchangeMoneyDB.find(filterRec).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    
    let data = {}
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

const getRecMoney = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
   
    let filterRec = {}
    if (q.start && q.end) {
        let startDate = Date.parse(q.start);
        let endDate = Date.parse(q.end);
        filterRec = {
            created_time_second: {$gt: startDate, $lt: endDate}
        }
    }
    if (q.accountNumber){
        filterRec['receiver_account_number'] = q.accountNumber
    } else {
        filterRec['receiver_id'] = req.user.user_id
    }
    if (q.isInside){
        filterRec['is_inside'] = q.isInside
    }
    if (q.partnerCode){
        filterRec['partner_code'] = q.partnerCode
    }
    //filterRec['$sum'] = "$money";
    
    let totalRec = await ExchangeMoneyDB.count(filterRec);

    let respRec = await ExchangeMoneyDB.find(filterRec).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    
    let sum = 0
    respRec.forEach( resp => {
        sum += resp.money
    })
    
    if (respRec) {
        return res.status(200).json({
            message: "Get all history sender successfully",
            data: respRec,
            total: totalRec,
            sum: sum,
        })
    }

    return res.status(400).json({
        message: "Can't get history sender at this time."
    })
}


const getSenMoney = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    // let startDate = req.query.start;
    // let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
   
    let filterSen = {}
    if (q.start && q.end) {
        let startDate = Date.parse(q.start);
        let endDate = Date.parse(q.end);
        filterRec = {
            created_time_second: {$gt: startDate, $lt: endDate}
        }
    }
    if (q.accountNumber){
        filterSen['sender_account_number'] = q.accountNumber
    } else {
        filterSen['sender_id'] = req.user.user_id
    }
    if (q.isInside){
        filterSen['is_inside'] = q.isInside
    }
    if (q.partnerCode){
        filterRec['partner_code'] = q.partnerCode
    }
    //filterRec['$sum'] = "$money";
    
    let totalSen = await ExchangeMoneyDB.count(filterSen);

    let respSen = await ExchangeMoneyDB.find(filterSen).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    
    let sum = 0
    respSen.forEach( resp => {
        sum += resp.money
    })
    
    if (respSen) {
        return res.status(200).json({
            message: "Get all history sender successfully",
            data: respSen,
            total: totalSen,
            sum: sum,
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
        const tempCurUser = await UserRole.findOne({ user_id: curUser.user_id });
        let now = new Date();
        let resp1 = await ExchangeMoneyDB.create({
            sender_id: curUser.user_id,
            receiver_id: curUser.user_id,
            is_inside: true,
            receiver_account_number: curUser.account_number,
            sender_account_number: curUser.account_number,
            receiver_full_name: tempCurUser.full_name,
            sender_full_name: tempCurUser.full_name,
            money: money,
            fee_type: feeType,
            message,
            created_time_second: now.getTime()
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
            let now = new Date();
            let resp1 = await ExchangeMoneyDB.create({
                sender_id: curUser.user_id,
                receiver_id: curUser.user_id,
                money: money,
                fee_type: feeType,
                is_inside: true,
                receiver_account_number: curUser.account_number,
                sender_account_number: curUser.account_number,
                receiver_full_name: curUser.full_name,
                sender_full_name: curUser.full_name,
                message,
                created_time_second: now.getTime()
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

    if (q.partnerCode) {
        data['partner_code'] = q.partnerCode;
    }
    data['is_inside'] = false;
    data['$sum'] = "$money";

    let resp = await ExchangeMoneyDB.find(data)
        .limit(limit ? limit : 20)
        .skip(skip ? skip : 0);

    if (resp) {
        if (getTotal){
            let resCount = await ExchangeMoneyDB.count(data)
            resp.total = resCount
        }
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
    getAllHistoryAdmin,
    getRecMoney,
    getSenMoney
};
const RemindDB = require('../models/remind.model');
const BankAccountDB = require('../models/bank_account.model')

require('dotenv').config({
    path: './config/config.env',
});

const createRemind = async(req, res, next) => {
    const { reminded, mess, debt } = req.body
    let currentAccount = await BankAccountDB.findOne({user_id: req.user.user_id, type: "STANDARD"})

    if(currentAccount == null){
        return res.status(400).json({
            message: "Can't find bank account of this user"
        })
    }

    let resp = await RemindDB.create({
        reminder_account_number: currentAccount.account_number,
        reminded_account_number: reminded,
        message: mess,
        debt: debt,
        status: "UNDONE"
    })
    if (resp) {
        return res.status(200).json({
            message: "Create successfully",
        })
    }

    return res.status(400).json({
        message: "Can't create remind"
    })
};

//Lấy danh sách nhắc nợ do bản thân tạo
const getReminder = async(req, res, next) => {   
    let currentAccount = await getMe(req, res, next);

    let resp = await RemindDB.find({
        reminder_account_number: currentAccount.data.account_number,
        status: "UNDONE"
    })

    if (resp) {
        return res.status(200).json({
            message: "Get reminder successfully",
            data: resp,
        })
    }

    return res.status(400).json({
        message: "Can't get reminder"
    })
}

//Lấy danh sách bị người khác nhắc
const getReminded = async(req, res, next) => {
    let currentAccount = await getMe(req, res, next);

    let resp = await RemindDB.find({
        reminded_account_number: currentAccount.data.account_number,
        status: "UNDONE"
    })

    if (resp) {
        return res.status(200).json({
            message: "Get reminded successfully",
            data: resp,
        })
    }

    return res.status(400).json({
        message: "Can't get reminded"
    })
}

const cancelRemind = async(req, res, next) => {
    const {remindId} = req.body;

    let resp = await RemindDB.updateOne({remind_id: remindId},{status:"CANCEL"})

    if(resp) {
        return res.status(200).json({
            message: "Get reminded successfully",
            data: resp,
        })
    }
    return res.status(400).json({
        message: "Can't get reminded"
    })
}

module.exports = {
    createRemind,
    getReminder,
    getReminded,
    cancelRemind
};
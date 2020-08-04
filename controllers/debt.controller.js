const RemindDB = require('../models/remind.model');
const BankAccountDB = require('../models/bank_account.model');

const { STANDARD_ACCOUNT, FEE_TRANSFER } = require('../utils/util')
const { handleTransfer } = require('./bank_account.controller');
const UserRoleDB = require('../models/user_role.model');

require('dotenv').config({
    path: './config/config.env',
});

//Tạo nhắc nợ POST
//Truyền vô body reminded, mess, debt
const createRemind = async (req, res, next) => {
    const { remindedAccount, remindedName, mess, debt } = req.body
    let currentAccount = await BankAccountDB.findOne({ user_id: req.user.user_id, type: STANDARD_ACCOUNT })
    if (!currentAccount) {
        return res.status(400).json({
            message: "Can't find bank account of this user"
        })
    }

    let resp = await RemindDB.create({
        reminder_account_number: currentAccount.account_number,
        reminder_full_name: req.user.full_name,
        reminded_account_number: remindedAccount,
        reminded_full_name: remindedName,
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

//Lấy danh sách nhắc nợ do bản thân tạo GET
const getReminder = async (req, res, next) => {
    // let startDate = req.query.start;
    // let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);

    let data = {};
    // if (startDate && endDate) {
    //     data = {
    //         $where: function () {
    //             return this.updated_date > startDate && this.updated_date < endDate;
    //         },
    //     };
    // }
    let currentAccount = await BankAccountDB.findOne({ user_id: req.user.user_id });
    if (currentAccount == null) {
        return res.status(400).json({
            message: "Can't get current account"
        });
    }
    data['reminder_account_number'] = currentAccount.account_number;
    data['status'] = "UNDONE";

    let total = await RemindDB.count(data);

    let resp = await RemindDB.find(data).sort({created_date:-1}).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);

    if (resp) {
        return res.status(200).json({
            message: "Get reminder successfully",
            data: resp,
            total
        })
    }

    return res.status(400).json({
        message: "Can't get reminder"
    })
}

//Lấy danh sách bị người khác nhắc GET
const getAllRemind = async (req, res, next) => {
    // let startDate = req.query.start;
    // let endDate = req.query.end;
    let q = JSON.parse(req.query.q);
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);

    let currentAccount = await BankAccountDB.findOne({ user_id: 38});//req.user.user_id });
    if (currentAccount == null) {
        return res.status(400).json({
            message: "Can't get current account"
        });
    }

    let data = {};
    if (q.type){
        switch (q.type){
            case "REMINDER":
                data['reminder_account_number'] = currentAccount.account_number;
                break;
            case "REMINDED":
                data['reminded_account_number'] = currentAccount.account_number;
                break;
            default:
               
                break;
        }
    } else {
        data = { $or: [{ 'reminder_account_number': currentAccount.account_number }, { 'reminded_account_number': currentAccount.account_number }]}
    }

    if (q.status){
        data['status'] = q.status;
    }

    let total = await RemindDB.count(data);

    let resp = await RemindDB.find(data).sort({created_date:-1}).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
    if (resp) {
        return res.status(200).json({
            message: "Get reminded successfully",
            data: resp,
            total
        })
    }

    return res.status(400).json({
        message: "Can't get reminded"
    })
}

const getReminded = async (req, res, next) => {
    // let startDate = req.query.start;
    // let endDate = req.query.end;
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);

    let data = {};
    // if (startDate && endDate) {
    //     data = {
    //         $where: function () {
    //             return this.updated_date > startDate && this.updated_date < endDate;
    //         },
    //     };
    // }
    let currentAccount = await BankAccountDB.findOne({ user_id: req.user.user_id });
    if (currentAccount == null) {
        return res.status(400).json({
            message: "Can't get current account"
        });
    }
    data['reminded_account_number'] = currentAccount.account_number;
    data['status'] = "UNDONE";

    let total = await RemindDB.count(data);

    let resp = await RemindDB.find(data).sort({created_date:-1}).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);

    if (resp) {
        return res.status(200).json({
            message: "Get reminded successfully",
            data: resp,
            total
        })
    }

    return res.status(400).json({
        message: "Can't get reminded"
    })
}

//Hủy nhắc nợ PUT
//Truyền vô body remindId
const cancelRemind = async (req, res, next) => {
    const { remindId } = req.body;

    let remind = await RemindDB.findOne({remind_id: remindId, status: "UNDONE"})
    if (!remind){
        return res.status(400).json({
            message: "Reminded isn't exist"
        })
    }

    let resp = await RemindDB.updateOne({ remind_id: remindId }, { status: "CANCEL" })

    if (resp) {
        return res.status(200).json({
            message: "Cancel reminded successfully.",
            data: resp,
        })
    }
    return res.status(400).json({
        message: "Cancel reminded fail."
    })
}

//Thanh toán nhắc nợ POST
//Truyền vô body remindId, reminderAccountNumber, debt, message
const payRemind = async (req, res, next) => {
    const { remindId, message } = req.body;

    let curUser = await BankAccountDB.findOne({ user_id: req.user.user_id, type: STANDARD_ACCOUNT }); // Note lại để test

    let remind = await RemindDB.findOne({remind_id: remindId, status:"UNDONE"});
    if (!remind){
        return res.status(400).json({
            message: remind.message
        })
    }

    let recUser = await BankAccountDB.findOne({ account_number: remind.reminder_account_number, type: STANDARD_ACCOUNT });

    if (curUser.balance < remind.debt){
        return res.status(400).json({
            message: "Pay remind fail. Your account don't have enough money."
        })
    }

    if (remind.debt == debt){
        let resp = await handleTransfer(curUser.user_id, recUser.user_id, remind.debt, message, "PAY", curUser.balance, recUser.balance, curUser.account_number, recUser.account_number, true);
        if (resp.status == "OK") {
            resp = await RemindDB.updateOne({ remind_id: remindId }, { status: "DONE" });
            if (resp) {
                return res.status(200).json({
                    message: "Pay remind successfully."
                });
            }
        }
    }

    return res.status(400).json({
        message: "Pay remind fail."
    })
}

module.exports = {
    createRemind,
    getReminder,
    getReminded,
    cancelRemind,
    payRemind,
    getAllRemind
};
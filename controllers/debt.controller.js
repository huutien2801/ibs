const RemindDB = require('../models/remind.model');
const BankAccountDB = require('../models/bank_account.model');

const {STANDARD_ACCOUNT, FEE_TRANSFER} = require('../utils/util')
const {handleTransfer} = require('./bank_account.controller');

require('dotenv').config({
    path: './config/config.env',
});

//Tạo nhắc nợ POST
//Truyền vô body reminded, mess, debt
const createRemind = async(req, res, next) => {
    const { reminded, mess, debt } = req.body
    let currentAccount = await BankAccountDB.findOne({user_id: req.user.user_id, type: STANDARD_ACCOUNT})

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

//Lấy danh sách nhắc nợ do bản thân tạo GET
const getReminder = async(req, res, next) => {   
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
    let currentAccount = await BankAccountDB.findOne({user_id: req.user.user_id});
    if(currentAccount == null){
        return res.status(400).json({
            message: "Can't get current account"
        });
    }

    let resp = await RemindDB.find({
        data,
        reminder_account_number: currentAccount.account_number,
        status: "UNDONE"
    }).limit(limit ? limit : 20)
    .skip(skip ? skip : 0);

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

//Lấy danh sách bị người khác nhắc GET
const getReminded = async(req, res, next) => {
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
    let currentAccount = await BankAccountDB.findOne({user_id: req.user.user_id});
    if(currentAccount == null){
        return res.status(400).json({
            message: "Can't get current account"
        });
    }

    let resp = await RemindDB.find({
        data,
        reminded_account_number: currentAccount.account_number,
        status: "UNDONE"
    }).limit(limit ? limit : 20)
    .skip(skip ? skip : 0);

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

//Hủy nhắc nợ PUT
//Truyền vô body remindId
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

//Thanh toán nhắc nợ POST
//Truyền vô body remindId, reminderAccountNumber, debt, message
const payRemind = async(req,res,next) =>{
    const {remindId, reminderAccountNumber, debt, message} = req.body;

    let curUser = await BankAccountDB.findOne({user_id: req.user.user_id, type: STANDARD_ACCOUNT}); // Note lại để test
    let recUser = await BankAccountDB.findOne({account_number: reminderAccountNumber, type: STANDARD_ACCOUNT});

    let resp = await handleTransfer(curUser.user_id, recUser.user_id, debt, message, "PAY", curUser.balance, recUser.balance);
    if(resp.status == "OK"){
        resp = await RemindDB.update({remind_id: remindId},{status:"DONE"});
        if (resp){
            return res.status(200).json({
                message: "Pay remind successfully."
            });
        }
    }

    return res.status(400).json({
        message: resp.message
    })
}

module.exports = {
    createRemind,
    getReminder,
    getReminded,
    cancelRemind,
    payRemind
};
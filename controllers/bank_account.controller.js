const BankAccountDB = require('../models/bank_account.model');
const RatioDB = require('../models/ratio.model');
const ExchangeMoneyDB = require('../models/exchange_money.model');
const {generateAccountNumber, generatePIN, FEE_TRANSFER, STANDARD_ACCOUNT, DEPOSIT_ACCOUNT} = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

//API create bank account of user POST
//truyền vào body type, balance, ratioMonth, deposit
const createBankAccount = async(req, res, next) => {
    const {type, balance, ratioMonth, deposit} = req.body

    let data = {
        user_id: req.user.user_id,
        account_number: generateAccountNumber(),
        type,
    }

    var currentTime = new Date();
    if (type == STANDARD_ACCOUNT){
        data["pin"] = generatePIN();
        data["expired_date"] = currentTime.setFullYear(expired_date.getFullYear() + 4);
    } else {
        data["deposit"] = deposit;
        data["deposit_date"] = currentTime;

        //get ratio rate and redeem
        let ratioResp = await RatioDB.findOne({months: ratioMonth});

        if (ratioMonth == null){
            return res.status(400).json({
                message: "Choose wrong deposit month."
            })
        }

        data["ratio_id"] = ratioResp.ratio_id;
        data["redeem"] = deposit * ratioResp.ratio / 100;
        data["redeem_date"] = currentTime.setMonth(currentTime.getMonth() + ratioResp.months);
    }

    let resp = await BankAccountDB.create({
        bank_account_type,
        balance,
        user_id
    });
    if(resp){
        return res.status(200).json({
            data: resp
        });
    }
    return res.status(400).json({
        message: "Can't create bank account at this time."
    })
}

//Chuyển khoản cùng ngân hàng  POST
//nếu type là PAY thì tự trả, BEPAY là bên kia trả
//Truyền vô body receiveAccount, amount, mess, type
const transferMoney = async (req, res, next) => {
    const {receiveAccount, amount, mess, type} = req.body;

    let curUser = await BankAccountDB.findOne({user_id: req.user.user_id, type:STANDARD_ACCOUNT});
    if (curUser == null) {
        return res.status(400).json({
            message: "Can't find user."
        })
    }
    let recUser = await BankAccountDB.findOne({account_number: receiveAccount, type: STANDARD_ACCOUNT});
    if (recUser == null){
        return res.status(400).json({
            message: "Can't find user receive."
        })
    }

    let handle = await handle(curUser.user_id, recUser.user_id, amount, mess, type, curUser.balance, recUser.balance);
    if(handle.status == "OK"){
        return res.status(200).json({
            message: handle.message
        });
    }
    
    return res.status(400).json({
        message:"Can't transfer money at this time."
    })
}

//Handle xử lý chuyển khoản
const handleTransfer = async(senderId, receiverId, amount, mess, feeType, curBalance, recBalance) => {
    let curAmountBef = 0; //Tính số tiền sau khi chuyển người gửi
    let recAmountBef = 0;
    if(type = "PAY"){
        curAmountBef = curBalance - amount - FEE_TRANSFER;
        recAmountBef = recBalance + amount;
    } else {
        curAmountBef = curBalance - amount;
        recAmountBef = recBalance + amount - FEE_TRANSFER;
    }

    let resp = await BankAccountDB.update({user_id: senderId, type: STANDARD_ACCOUNT}, {balance: curAmountBef});
    let respRec = await BankAccountDB.update({account_number: receiverId, type: STANDARD_ACCOUNT}, {balance: recAmountBef });
    if (resp && respRec){
            //create log transfer money
            ExchangeMoneyDB.create({
                sender_id: senderId,
                receiver_id: receiverId,
                money: amount,
                message: mess,
                fee_type: feeType
            })

            return json({
                status: "OK",
                message: "Transfer money successfully."
            })
        
    }

    return json({
        status: "ERROR",
        message: "Can't transfer money at this time."
    });
}

module.exports = {
    createBankAccount,
    transferMoney,
    handleTransfer
};
    
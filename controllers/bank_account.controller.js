const BankAccountDB = require('../models/bank_account.model');
const RatioDB = require('../models/ratio.model');
const ExchangeMoneyDB = require('../models/exchange_money.model');
const UserRoleDB = require('../models/user_role.model');
const TransferMoneyTempDB = require('../models/transfer_money_temp.model');
const OTPDB = require('../models/otp.model');
const {generateAccountNumber, generatePIN, generateOTP, sendOTPMail, FEE_TRANSFER, STANDARD_ACCOUNT, DEPOSIT_ACCOUNT} = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

const getBankAccountStandard = async(req, res, next) => {
    let bankAccount = await BankAccountDB.findOne({user_id: req.user.user_id, type: STANDARD_ACCOUNT})
    if (bankAccount){
        return res.status(200).json({
            message: "Get bank standard account successful.",
            data: bankAccount
        })
    }

    return res.status(400).json({
        message: "Get bank standard account fail."
    })
}

const getBankAccountDeposit = async(req, res, next) => {
    let offset = parseInt(req.query.offset);
    let limit = parseInt(req.query.limit);
    let accountNumber = req.query.accountNumber;
    filter = {
        user_id: req.user.user_id,
        type: DEPOSIT_ACCOUNT
    }
    if (accountNumber){
        filter['account_number'] = accountNumber
    }
    let bankAccount = await BankAccountDB.find(filter).sort({register_date: -1}).limit(limit ? limit : 20).skip(offset ? offset : 0)
    if (bankAccount){
        return res.status(200).json({
            message: "Get bank deposit account successful.",
            data: bankAccount
        })
    }

    return res.status(400).json({
        message: "Get bank deposit account fail."
    })
}

//API create bank account of user POST
//truyền vào body type, balance, ratioMonth, deposit
const createBankAccount = async(req, res, next) => {
    const {userId, type, balance, ratioMonth, deposit} = req.body

    let filter = {};
    let currentUserId;
    if (userId){
        filter['user_id'] = userId;
        currentUserId = userId;
    } else {
        filter['user_id'] = req.user.user_id;
        currentUserId = req.user.user_id;
    }

    let user = await UserRoleDB.findOne(filter);
    if (!user){
        return res.status(400).json({
            message: "User is not exist."
        })
    }

    let data = {
        user_id: filter['user_id'],
        type,
    }

    
    if (type == STANDARD_ACCOUNT){
        let currentTime = new Date();
        if (!userId) {
            return res.status(400).json({
                message: "Invalid userID."
            })
        }
        data["account_number"] = "9700" + user.identity_number;
        data["pin"] = generatePIN();
        data["balance"] = parseInt(balance);
        data["expired_date"] = currentTime.setFullYear(currentTime.getFullYear() + 4);
    } else {
        let depositDate = new Date();
        let redeemDate = new Date();
        let currentBankAccount = await BankAccountDB.findOne({user_id: currentUserId, type: STANDARD_ACCOUNT});
        if (parseInt(deposit) > parseInt(currentBankAccount.balance))
        {
            
            return res.status(400).json({
                message: "Your balance is not enough"
            })
        }
        else {
            let newBalance = parseInt(currentBankAccount.balance) - parseInt(deposit);
            let updateBalance = await BankAccountDB.findOneAndUpdate({user_id: currentUserId, type: STANDARD_ACCOUNT}, {balance: newBalance})
            if (!updateBalance)
            {
                return res.status(400).json({
                    message: "Error when creating saving account"
                })
            }
        }
        
        data["deposit"] = deposit;
        data["deposit_date"] = depositDate;
        data["account_number"] = generateAccountNumber();
        //get ratio rate and redeem
        let ratioResp = await RatioDB.findOne({month: ratioMonth});

        if (!ratioResp && ratioResp.month){
            return res.status(400).json({
                message: "Choose wrong deposit month."
            })
        }
        redeemDate = redeemDate.setMonth(redeemDate.getMonth() + parseInt(ratioResp.month));
        data["ratio_id"] = ratioResp.ratio_id;
        data["redeem"] = parseInt(deposit * ratioResp.ratio / 100) + parseInt(deposit);

        data["redeem_date"] = redeemDate;
    }

    let resp = await BankAccountDB.create(data);
    if(resp){
        return res.status(200).json({
            data: resp
        });
    }
    return res.status(400).json({
        message: "Can't create bank account at this time."
    })
}

const redeemDepositAccount = async (req, res, next) => {
    const { accountNumber } = req.body

    let account = await BankAccountDB.findOne({
        bank_account: accountNumber,
        user_id: req.user.user_id,
        type: "DEPOSIT"
    })

    if (account) {
        let deleAcc = await BankAccountDB.deleteOne({
            bank_account: accountNumber,
            user_id: req.user.user_id,
            type: "DEPOSIT"
        })
        if (deleAcc) {
            return res.status(200).json({
                message: "Redeem succeed."
            });
        }
    }
    return res.status(400).json({
        message: "Redeem fail."
    });
}

//Chuyển khoản cùng ngân hàng  POST
//nếu type là PAY thì tự trả, BEPAY là bên kia trả
//Truyền vô body receiveAccount, amount, mess, type
const transferMoney = async (req, res, next) => {
    const {receiverAccountNumber, amount, message, feeType} = req.body;
    let currentUserRole = await UserRoleDB.findOne({user_id: req.user.user_id});
    let otpCode = generateOTP();
    let resp = await sendOTPMail(currentUserRole.email, currentUserRole.full_name, otpCode);
    if (resp.status == "OK") {
        await OTPDB.create({
            email: currentUserRole.email,
            otp: otpCode
        })
    } else {
        return res.status(400).json({
            message: "Error when sending email"
        })
    }
    let temp = await TransferMoneyTempDB.create({
        sender_user_id: currentUserRole.user_id,
        receiver_account_number: receiverAccountNumber,
        amount,
        message,
        fee_type: feeType
    })
    if (!temp)
    {
        return res.status(400).json({
            message: "Error when transfering money"
        })
    }
    else {
        return res.status(200).json({
            message: "OTP sent",
            status: "SENT"
        })
    }
}

const confirmOTPTransferMoney = async(req, res, next) => {
    const {OTP} = req.body;
    let currentUserRole = await UserRoleDB.findOne({user_id: req.user.user_id});
    filter = {}
    filter['email'] = currentUserRole.email;

    let otp = await OTPDB.find(filter).limit(1).sort({createdAt:-1})
    if (!otp){
        let deleteTransferMoney = await TransferMoneyTempDB.deleteMany({sender_user_id: currentUserRole.user_id});
        return res.status(400).json({
            status: "ERROR",
            message: "Your OTP code is expired."
        })
    }
    if (otp[0].otp == OTP){
        let data = await TransferMoneyTempDB.findOne({sender_user_id: currentUserRole.user_id}).sort({created_at: -1});
        let currentBankAccount = await BankAccountDB.findOne({user_id: currentUserRole.user_id});
        let receiverBankAccount = await BankAccountDB.findOne({account_number: data.receiver_account_number});
        let handle = await handleTransfer(currentUserRole.user_id, receiverBankAccount.user_id, data.amount, data.message, data.fee_type, currentBankAccount.balance, receiverBankAccount.balance, currentBankAccount.account_number,  data.receiver_account_number, true);
        if(handle.status == "OK"){
            let deleteTransferMoney = await TransferMoneyTempDB.deleteMany({sender_user_id: currentUserRole.user_id});
            return res.status(200).json({
                message: "Transfer money success"
        });
        }
        return res.status(400).json({
            status: "ERROR",
            message: "OTP did't match"
        })
    }
}




//Handle xử lý chuyển khoản
const handleTransfer = async(senderId, receiverId, amount, mess, feeType, curBalance, recBalance, senderAc, receiveAc, isInside) => {
    let curAmountBef = 0; //Tính số tiền sau khi chuyển người gửi
    let recAmountBef = 0;
    if(feeType == "PAY"){
        curAmountBef = curBalance - amount - FEE_TRANSFER;
        recAmountBef = recBalance + amount;
    } else {
        curAmountBef = curBalance - amount;
        recAmountBef = recBalance + amount - FEE_TRANSFER;
    }

    let resp = await BankAccountDB.updateOne({user_id: senderId, type: STANDARD_ACCOUNT}, {balance: curAmountBef});
    let respRec = await BankAccountDB.updateOne({user_id: receiverId, type: STANDARD_ACCOUNT}, {balance: recAmountBef });
    let senderUserRole = await UserRoleDB.findOne({ user_id: senderId});
    let receiverUserRole = await UserRoleDB.findOne({ user_id: receiverId});
    if (resp && respRec){
        //create log transfer money
        let now = new Date();
        await ExchangeMoneyDB.create({
            sender_id: senderId,
            receiver_id: receiverId,
            money: amount,
            message: mess,
            fee_type: feeType,
            receiver_account_number: receiveAc,
            sender_account_number: senderAc,
            receiver_full_name: receiverUserRole.full_name,
            sender_full_name: senderUserRole.full_name,
            is_inside: isInside,
            created_time_second: now.getTime(),
        })

        return ({
            status: "OK",
            message: "Transfer money successfully."
        })
        
    }

    return ({
        status: "ERROR",
        message: "Can't transfer money at this time."
    });
}

module.exports = {
    createBankAccount,
    transferMoney,
    handleTransfer,
    getBankAccountStandard,
    getBankAccountDeposit,
    confirmOTPTransferMoney,
    redeemDepositAccount
};
    
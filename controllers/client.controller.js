const Partner = require('../models/partner.model');
const PartnerLog = require("../models/partner_logs.model")
const BankAccount = require('../models/bank_account.model');
const ExchangeMoney = require('../models/exchange_money.model');
const UserRoleDB = require('../models/user_role.model');
const OTPDB = require('../models/otp.model');
const TransferMoneyTempDB = require('../models/transfer_money_temp.model');
const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
const md5 = require('md5');
const NodeRSA = require('node-rsa');
const axios = require('axios');
const { Error } = require('mongoose');
const { generateAccountNumber, generatePIN, generateOTP, sendOTPMail, FEE_TRANSFER, FEE_TRANSFER_BANK, STANDARD_ACCOUNT, DEPOSIT_ACCOUNT } = require('../utils/util')

//Hai API để call sang service khác lấy thông tin khách hàng
const getAccountInfoSAPHASANBANK = async (req, res, next) => {
   axios({
      method: 'post',
      url: '/user/12345',
      data: {
         firstName: 'Fred',
         lastName: 'Flintstone'
      },
      headers: {

      }
   });
}

const getAccountInfoQLBank = async (req, res, next) => {
   let ts = Date.now();
   let data = {
      accountNumber: req.query.accountNumber
   }
   let hashStr = md5(ts + data + md5("dungnoiaihet"));
   axios({
      method: 'post',
      url: 'https://qlbank1.herokuapp.com/api/external/customer',
      data,
      headers: {
         ts,
         partnerCode: "3TBank",
         hashedSign: hashStr,
      }
   })
      .then(function (response) {
         return res.status(200).json({
            message: "Get succeeded",
            data: response.data
         })
      }).catch(function (error) {
         return res.status(400).json({
            message: "Get failed" + error
         })
      })
}

const transferMoneyQLBank = async (req, res, next) => {
   const { receiverAccountNumber, amount, message, feeType, partnerCode } = req.body;
   switch (partnerCode) {
      case "SAPHASANBank":
         break;
      default:
         return res.status(400).json({
            message: "Your bank is not my partner. Please connect to my bank and call API later"
         })
   }
   let currentUserRole = await UserRoleDB.findOne({ user_id: req.user.user_id });
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
      receiver_account_number: parseInt(receiverAccountNumber),
      amount,
      message,
      fee_type: feeType,
      partner_code: partnerCode
   })
   if (!temp) {
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



const confirmOTPTransferMoneyQLBank = async (req, res, next) => {
   const { OTP, receiverName } = req.body;
   let currentUserRole = await UserRoleDB.findOne({ user_id: req.user.user_id });
   let currentBankAccount = await BankAccount.findOne({ user_id: req.user.user_id });
   filter = {}
   filter['email'] = currentUserRole.email;
   let otp = await OTPDB.find(filter).limit(1).sort({ createdAt: -1 })
   if (!otp) {
      let deleteTransferMoney = await TransferMoneyTempDB.deleteMany({ sender_user_id: currentUserRole.user_id });
      return res.status(400).json({
         status: "ERROR",
         message: "Your OTP code is expired."
      })
   }
   if (otp[0].otp != OTP) {
      return res.status(400).json({
         message: "OTP not matched",
      })
   }
   if (otp[0].otp == OTP) {
      let ts = Date.now();
      let dataTemp = await TransferMoneyTempDB.findOne({ sender_user_id: currentUserRole.user_id }).sort({ created_at: -1 });
      let finalAmount = 0
      let data = {
         sentUserId: currentBankAccount.account_number, // của ng gửi
         sentUserName: currentUserRole.full_name, // của ng gửi
         accountNumber: dataTemp.receiver_account_number, // account number của ng nhận
         amount: parseInt(dataTemp.amount),
         content: dataTemp.message
      }
      if (dataTemp.fee_type == "PAY") {
         finalAmount = parseInt(dataTemp.amount) + FEE_TRANSFER_BANK
         data["isReceiverPaid"] = false
      }
      else {
        finalAmount  = parseInt(dataTemp.amount)
        data["isReceiverPaid"] = true
      }
      let hashStr = md5(ts + data + md5("dungnoiaihet"))
      const keyPrivate = new NodeRSA(process.env.RSA_PRIVATE_KEY)
      let sign = keyPrivate.sign(data, "base64", "base64")

      let resp = await axios({
         method: 'post',
         url: 'https://qlbank1.herokuapp.com/api/external/transaction',
         data,
         headers: {
            ts,
            partnerCode: '3TBank',
            hashedSign: hashStr,
            sign
         }
      })

      if (resp && !resp.error) {
         let newBalance = currentBankAccount.balance - parseInt(finalAmount)
         BankAccount.findOneAndUpdate({ account_number: currentBankAccount.account_number }, { balance: parseInt(newBalance) }, function (err1, response1) {
            if (!err1) {
               ExchangeMoney.create({
                  partnerCode: dataTemp.partner_code,
                  sender_id: currentUserRole.user_id,
                  money: dataTemp.amount,
                  message: dataTemp.message,
                  fee_type: dataTemp.fee_type,
                  is_inside: false,
                  receiver_account_number: dataTemp.receiver_account_number,
                  sender_account_number: currentBankAccount.account_number,
                  sender_full_name: currentUserRole.full_name,
                  receiver_full_name: receiverName,
                  sign: resp.data.sign
               }, function (err2, resp) {
                  if (!err2) {
                     return res.status(200).json({
                        message: "Transfer succeeded",
                        dataRes: resp.data
                     })
                  }
               })
            }
         })
      } else {
         return res.status(400).json({
            message: "Transfer failed",
         })
      }
   }
}












// const depositMoneyQLBank = async ( req,res,next) => {
//   let ts = Date.now();
//   let data = {
//     sentUserId: req.query.accountNumber, // của ng gửi
//     sentUserName: req.query.fullName, // của ng gửi
//     accountNumber: req.body.receiverAccountNumber, // account number của ng nhận
//     amount: req.body.amount,
//     content: req.body.message
//   }
//   let hashStr = md5(ts + data + md5("dungnoiaihet"));
//   //const keyPublic = new NodeRSA("-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyceITLtFoy4KzMgmr6NEnvk1VBH7pRuyyg7IkXc3kBspKs9CIErm2eJtEtduIPQK+3AgiQW+fjL1dDMQr7ENZiGzWhEPoSbU348mjg1fxFDztFB4QiqAd7UUvj1kK2/UT+D0C6Sgc0O69C9lRGahPSAX+7ZArGIodtfuOKPenEwIDAQAB-----END PUBLIC KEY-----")
//   const keyPrivate = new NodeRSA(process.env.RSA_PRIVATE_KEY)
//   let sign =  keyPrivate.sign(data, "base64", "base64")
//   axios({
//     method: 'post',
//     url: 'https://qlbank1.herokuapp.com/api/external/transaction',
//     data,
//     headers: {
//         ts,
//         partnerCode: "3TBank",
//         hashedSign: hashStr,
//         sign
//     },
//   })
//   .then(function(response){
//     let receiver = BankAccount.findOne({account_number: req.query.accountNumber}, function(err, response1) {
//       if (err)
//       {
//         return res.status(400).json({
//           message: "Transfer failed" + err
//         })
//       }
//       else {
//         let newBalance = parseInt(response1.balance) - parseInt(req.body.amount);
//         let update = BankAccount.findOneAndUpdate({account_number: req.query.accountNumber}, {balance: parseInt(newBalance)}, function(err, response2) {
//           if (err)
//           {
//             return res.status(400).json({
//               message: "Transfer failed 2" + err
//             })
//           }
//           else {
//             return res.status(200).json({
//               message: "Transfer succeeded",
//               data: response.data
//             })
//           }
//         });
//       }
//     });
//   }).catch(function(error){
//     return res.status(400).json({
//       message: "Transfer failed" + error
//     })
//   })
// }

module.exports = {
   getAccountInfoQLBank,
   transferMoneyQLBank,
   confirmOTPTransferMoneyQLBank
}
const Partner = require('../models/partner.model');
const PartnerLog = require("../models/partner_logs.model")
const BankAccount = require('../models/bank_account.model');
const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
const md5 = require('md5');
const NodeRSA = require('node-rsa');
const axios = require('axios');
const { Error } = require('mongoose');
//Hai API để call sang service khác lấy thông tin khách hàng
const getAccountInfoSAPHASANBANK = async ( req,res,next) => {
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

const getAccountInfoQLBank = async ( req,res,next) => {
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
    .then(function(response){
      return res.status(200).json({
        message: "Get succeeded",
        data: response.data
      })
    }).catch(function(error){
      return res.status(400).json({
        message: "Get failed" + error
      })
    })
}

const depositMoneyQLBank = async ( req,res,next) => {
  let ts = Date.now();
  let data = {
    sentUserId: req.query.accountNumber, // của ng gửi
    sentUserName: req.query.fullName, // của ng gửi
    accountNumber: req.body.receiverAccountNumber, // account number của ng nhận
    amount: req.body.amount,
    content: req.body.message
  }
  let hashStr = md5(ts + data + md5("dungnoiaihet"));
  //const keyPublic = new NodeRSA("-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyceITLtFoy4KzMgmr6NEnvk1VBH7pRuyyg7IkXc3kBspKs9CIErm2eJtEtduIPQK+3AgiQW+fjL1dDMQr7ENZiGzWhEPoSbU348mjg1fxFDztFB4QiqAd7UUvj1kK2/UT+D0C6Sgc0O69C9lRGahPSAX+7ZArGIodtfuOKPenEwIDAQAB-----END PUBLIC KEY-----")
  const keyPrivate = new NodeRSA(process.env.RSA_PRIVATE_KEY)
  let sign =  keyPrivate.sign(data, "base64", "base64")
  axios({
    method: 'post',
    url: 'https://qlbank1.herokuapp.com/api/external/transaction',
    data,
    headers: {
        ts,
        partnerCode: "3TBank",
        hashedSign: hashStr,
        sign
    },
  })
  .then(function(response){
    let receiver = BankAccount.findOne({account_number: req.query.accountNumber}, function(err, response1) {
      if (err)
      {
        return res.status(400).json({
          message: "Transfer failed" + err
        })
      }
      else {
        let newBalance = parseInt(response1.balance) - parseInt(req.body.amount);
        console.log(req.body.amount);
        console.log(newBalance);
        let update = BankAccount.findOneAndUpdate({account_number: req.query.accountNumber}, {balance: parseInt(newBalance)}, function(err, response2) {
          if (err)
          {
            return res.status(400).json({
              message: "Transfer failed 2" + err
            })
          }
          else {
            return res.status(200).json({
              message: "Transfer succeeded",
              data: response.data
            })
          }
        });
      }
    });
  }).catch(function(error){
    return res.status(400).json({
      message: "Transfer failed" + error
    })
  })
}

module.exports = {
  getAccountInfoQLBank,
  depositMoneyQLBank
}
const User = require('../models/users.model');
const Partner = require('../models/partner.model');
const BankAccount = require('../models/bank_account.model');
const jwt = require('jsonwebtoken');
const ErrorCode = require('../config/ErrorCode');
const md5 = require('md5');
const NodeRSA = require('node-rsa');

require('dotenv').config({
    path: './config/config.env',
});

//Expose two API for others bank

//API get info account on service
const getInfoUser = (req, res, next) => {

    //If parnertCode is invalid
    let partnerCode = req.query.partnerCode
    //Call to DB to check partner 
    let partner = await Partner.findOne({ partnerCode }).
    exec(function(err, Partner){
        if (err) { 
            return res.json({
                message: err
            });
        }
    });

    if (!partner) {
        return res.status(400).json({
            message: "Your bank is not my partner. Please connect to my bank and call API later"
        });
    }

    if (!req.headers.ts) {
        return res.status(400).json({
            message: 'Lack of time request'
        });
    }

    //Convert date into secs to compare
    let requestedDate = new Date(req.headers.ts)
    let secondRequestedDate = requestedDate.getTime()

    let currentDate = new Date()
    let secondCurrentDate = currentDate.getTime()

    //If Requested date is greater than current date
    //Return false
    //Else we'll check if delta time between requested date and current date is less 60 seconds.
    //Your request will be approved
    if (secondRequestedDate > secondCurrentDate) {
        return res.status(400).json({
            message: 'Your request time is greater than current time'
        });
    } else {
        if (Math.abs(secondCurrentDate - secondRequestedDate) > 60) {
            return res.status(500).json({
                message: 'Request time out'
            });
        }
    }

    //If your request is updated
    //Compare partner sign on header
    if (!req.headers.sig) {
        return res.status(400).json({
            message: 'Lack of your signature. Please fill it into header'
        });
    }
    let secretKey = partner.partnerSecretKey
    let hashSecretKey = md5(secretKey)
    let body = req.body
    let hashStr = md5(body + secondRequestedDate + hashSecretKey)
    if (hashStr !== req.headers.sig) {
        return res.status(400).json({
            message: 'Your request is updated by someone'
        });
    }

    let { username } = req.body
    //Call to DB to get info username
    User.findOne({ username }, {
        'username': 1,
        'email': 1
    }).exec(function(err, User){
        if (err) { return err; }
        return res.status(200).json({});
    });
}

//API Recharging money in account from others bank
const rechargeMoneyInAccount = async(req, res, next) => {
    //If parnertCode is invalid
    let partnerCode = req.query.partnerCode
    //Call to DB to check partner 
    if (!partnerCode) {
        return res.status(ErrorCode.INVALID_PARAMETER.code).json({
            message: ErrorCode.INVALID_PARAMETER.message
        });
    }

    let partner = await Partner.findOne({ partnerCode }).
    exec(function(err, Partner){
        if (err) { 
            return res.json({
                message: err
            });
        }
    });
    if (!partner){
        return res.status(400).json({
            message: "Your bank is not my partner. Please connect to my bank and call API later"
        });
    }

    if (!req.headers.ts) {
        return res.status(400).json({
            message: 'Lack of time request'
        });
    }

    //Convert date into secs to compare
    let requestedDate = new Date(req.headers.ts)
    let secondRequestedDate = requestedDate.getTime()

    let currentDate = new Date()
    let secondCurrentDate = currentDate.getTime()

    //If Requested date is greater than current date
    //Return false
    //Else we'll check if delta time between requested date and current date is less 60 seconds.
    //Your request will be approved
    if (secondRequestedDate > secondCurrentDate) {
        return res.status(400).json({
            message: 'Your request time is greater than current time'
        });
    } else {
        if (Math.abs(secondCurrentDate - secondRequestedDate) > 60) {
            return res.status(500).json({
                message: 'Request time out'
            });
        }
    }

    //If your request is updated
    //Compare partner sign on header
    if (!req.headers.sig) {
        return res.status(400).json({
            message: 'Lack of your signature. Please fill it into header'
        });
    }
 
    let secretKey = partner.partnerSecretKey
    let hashSecretKey = md5(secretKey)
    let body = req.body
    let hashStr = md5(body + secondRequestedDate + hashSecretKey)
    if (hashStr !== req.headers.sig) {
        return res.status(400).json({
            message: 'Your request is updated by someone'
        });
    }

    let { sign } = req.body
    //If partner using RSA 
    //Get keyPrivate of partner to verify
    //Call to DB to get keyPrivate of partner
    // let keyPrivateStr = "-----BEGIN RSA PRIVATE KEY-----" +
    // "MIIBOwIBAAJBAL5t2Sxzw8uXW0eWPlfRWUNrF0y2JbjB5XzusIiUtPo+zSmrMByr\n" +
    // "jMlIEEdX7sZct/zANGhsrrRovSMKV7EkoKkCAwEAAQJBALJcoTWJmLJwqgZ7KxmF\n" +
    // "9F25SLGJSfurYQ+LYb4Lyxc3bRmHqKH/CuenKf9MOZ9nVs0Wwt+4UjdsCD7wE+JS\n" +
    // "OaECIQDpxo/kw3PrVycMD6bXtX8FkPDgkJvzy1pXZgUEEfS7JwIhANCIWqSfe5J4\n" +
    // "jz5Pa7kZM/Mg2gmU6GB+5m3VV3TXlGevAiEAyOQHN3D2pmBof6bbmzauhxv8wx3B\n" +
    // "xokTg1N6L/s2MbUCID6cQgLdc3+1vORreh94JrXf7jckQ2T9lPfzLzAArik3AiAc\n" +
    // "j3rbSsZDYdfJF+7Y1lsKCHDeRByHs5oLe6S9F0UBMQ==\n" +
    // "-----END RSA PRIVATE KEY-----"

    //const keyPrivate = new NodeRSA(keyPrivateStr)
    const keyPrivate = new NodeRSA(partner.secretKey)
    let isSuccess = keyPrivate.verify(body, sign, "base64", "base64")

    //Verify success
    if(isSuccess == true){
        //Call to DB to update money
        const filter = { userId: req.body.userId };
        const update = { balance:  req.body.newBalance};
        await BankAccount.findOneAndUpdate(filter, update)
        .exec(function(err){
            if (err) { 
                return res.status(400).json({
                    message: err
                });
            }
        });
    }
    return res.status(400).json({
        message: 'Verify your signature failed.'
    });
    
}

//API create user use bank
//Create new user -> create new bank account of user
const createUser = async(req, res, next) => {
    
    const {username, password, email} = req.body;

    if(username == "" || password == ""){
        return res.status(400).json({
            message: "username or passwork invalid"
        })
    }

    const user = await User.create({
        username,
        email,
        password,
        role_id: 3,
    });

    if (user == null){
        return res.status(400).json({
            message: "Can't create user"
        })
    }

    await BankAccount.create({
        userId: user.user_id,
        bankAccountType: 1,
        balance: 0,
    });

    res.status(200).json({
        message: "Create"
    })
}

module.exports = {
    getInfoUser,
    rechargeMoneyInAccount,
    createUser,
};


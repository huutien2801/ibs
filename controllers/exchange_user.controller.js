const ExchangeUser = require('../models/exchange_user.model');
const User = require('../models/bank_account.model');
const UserRole = require('../models/user_role.model');


require('dotenv').config({
    path: './config/config.env',
});

const addUserToList = async(req, res, next) => {
    const { receiverAccountNumber } = req.body
    let resp = await ExchangeUser.create({
        //sender_account_number: UserRole.findOne({ user_id: req.user.id }).select('account_number'), // Note lại để test
        //sender_full_name: User.findById({ user_id: req.user.id }).select('full_name'), // Note lại để test
        sender_account_number: "123124",
        sender_full_name: "La Thoai",
        receiver_account_number: receiverAccountNumber,
        //receiver_full_name: User.findOne({ account_number: receiverAccountNumber }).full_name // Note lại để test
        receiver_full_name: "Thoai La"
    })
    if (resp) {
        return res.status(200).json({
            message: "Saved successfully",
            status: 200
        })
    }
    else {
        return res.status(400).json({
            message: "Can't save to your list"
        })
    }
};

const showList = async(req, res, next) => {
    //let resp = ExchangeUser.find({ sender_id: req.user.id }) // Note lại để test
    ExchangeUser.find({sender_account_number: 123124}, function(err, users) {
        if (users.length) {
            return res.status(200).json({
                users
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    })   
};



module.exports = {
    addUserToList,
    showList,
};
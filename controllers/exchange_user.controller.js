const ExchangeUser = require('../models/exchange_user.model');
const User = require('../models/user.model');
const UserRole = require('../models/user_role.model');


require('dotenv').config({
    path: './config/config.env',
});

const addUserToList = async(req, res, next) => {
    const { receiverAccountNumber } = req.body
    let resp = ExchangeUser.create({
        sender_account_number: UserRole.findOne({ user_id: req.user.id }).select('account_number'), // Token
        sender_full_name: User.findById({ user_id: req.user.id }).select('full_name'), // Token
        receiver_account_number: receiverAccountNumber,
        receiver_full_name: User.findOne({ account_number: receiverAccountNumber }).select('full_name')
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
    let resp = ExchangeUser.find({ sender_id: req.user.id }) // Token
    if (resp) {
        return res.status(200).json({
            data: {
                account_number: resp.select('receiver_account_number'),
                full_name: resp.select('receiver_full_name')
            },
            status: 200
        })
    }
    else {
        return res.status(400).json({
            message: "Empty list"
        })
    }
};



module.exports = {
    addUserToList,
    showList,
};
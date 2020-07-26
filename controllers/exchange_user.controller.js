const ExchangeUser = require('../models/exchange_user.model');
const User = require('../models/bank_account.model');
const UserRole = require('../models/user_role.model');


require('dotenv').config({
    path: './config/config.env',
});

const addUserToList = async(req, res, next) => {
    const { receiverAccountNumber } = req.body
    let resp = await ExchangeUser.create({
        sender_account_number: UserRole.findOne({ user_id: req.user.user_id }).select('account_number'), 
        sender_full_name: User.findById({ user_id: req.user.user_id }).select('full_name'), 
        receiver_account_number: receiverAccountNumber,
        receiver_full_name: User.findOne({ account_number: receiverAccountNumber }).full_name 
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
    let curUser = User.find({ user_id: req.user.user_id });
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
    ExchangeUser.find({sender_account_number: curUser.account_number, data}, function(err, users) {
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
    }).limit(limit ? limit : 20)
      .skip(skip ? skip : 0);
};



module.exports = {
    addUserToList,
    showList,
};
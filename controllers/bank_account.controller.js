const BankAccount = require('../models/bank_account.model');

require('dotenv').config({
    path: './config/config.env',
});

//API create bank account of user
const createBankAccount = async(req, res, next) => {
    const {bank_account_type, balance, user_id} = req.body

    let resp = await BankAccount.create({
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

module.exports = {
    createBankAccount,
};
    
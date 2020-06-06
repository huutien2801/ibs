const BankAccountDB = require('../models/bank_account.model');
const RatioDB = require('../models/ratio.model');
const {generateAccountNumber, generatePIN} = require('../utils/util')

require('dotenv').config({
    path: './config/config.env',
});

//API create bank account of user
const createBankAccount = async(req, res, next) => {
    const {type, balance, ratioMonth, deposit} = req.body

    let data = {
        user_id: req.user.user_id,
        account_number: generateAccountNumber(),
        type,
    }

    var currentTime = new Date();
    if (type == "STANDARD"){
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

module.exports = {
    createBankAccount,
};
    
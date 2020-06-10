const ExchangeMoneyDB = require('../models/exchange_money.model')

require('dotenv').config({
    path: './config/config.env',
});

//Lấy lịch sử thanh toán GET
//Truyền query q={userId}
const getAllById = async(req, res, next) => {
    let q = req.query.q;

    let respSender = await ExchangeMoneyDB.find({sender_id: q.userId});
    let respRec = await ExchangeMoneyDB.find({receiver_id: q.userId});
    let data = {};

    if(respSender && respRec){
        data["sender"] = respSender;
        data["receive"] = respRec;
        return res.status(200).json({
            message:"Get all history sender successfully",
            data: data
        })
    }

    return res.status(400).json({
        message: "Can't get history sender at this time."
    })
}

module.exports = {
    getAllById
};
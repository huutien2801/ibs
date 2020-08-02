const RatioDB = require('../models/ratio.model');

require('dotenv').config({
    path: './config/config.env',
});

const getRatio = async(req, res, next) => {
    let ratioResp = await RatioDB.find({})
    if (ratioResp){
        return res.status(200).json({
            message: "Get ratio succeed.",
            data: ratioResp
        })
    }

    return res.status(400).json({
        message: "Get ratio fail. " + ratioResp.message
    })
}

const createRatio = async(req, res, next) => {
    const {month, ratio} = req.body
    console.log(month, ratio)
    let ratioResp = await RatioDB.create({
        month,
        ratio
    })
    if (ratioResp){
        return res.status(200).json({
            message: "Create ratio succeed.",
        })
    }

    return res.status(400).json({
        message: "Create ratio fail. " + ratioResp.message
    })
}

const updateRatio = async(req, res, next) => {
    const { ratioID, month, ratio} = req.body

    let ratioResp = await RatioDB.updateOne({ratio_id: ratioID},{
        month,
        ratio
    })
    if (ratioResp){
        return res.status(200).json({
            message: "Update ratio succeed.",
            data: ratio,
        })
    }

    return res.status(400).json({
        message: "Update ratio fail. " + ratioResp.message
    })
}

module.exports = {
    getRatio,
    createRatio,
    updateRatio,
};
    
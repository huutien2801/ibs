const Partner = require('../models/partner.model');

require('dotenv').config({
    path: './config/config.env',
});

//API create partner
const createPartner = async(req, res, next) => {
    const {partnerCode, partnerName, partnerPublicKey, partnerSecretKey} = req.body

    if(partnerCode == "" || partnerPublicKey == "" || partnerSecretKey == ""){
        return res.status(400).json({
            message: "INVALID BODY"
        })
    }

    let resp = await Partner.create({
        partnerCode,
        partnerName,
        partnerPublicKey,
        partnerSecretKey
    });
    if(resp){
        return res.status(200).json({
            data: resp
        });
    }
    return res.status(400).json({
        message: "Can't create partner at this time."
    })
}

module.exports = {
    createPartner,
};
    
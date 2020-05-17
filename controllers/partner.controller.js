const Partner = require('../models/partner.model');
const md5 = require('md5');
const NodeRSA = require('node-rsa');

require('dotenv').config({
    path: './config/config.env',
});

//API Recharging money in account from others bank
const createPartner = async(req, res, next) => {
    let partner = req.body

    let resp = Partner.create(partner);
    return res.json({
        data: resp
    });
}

module.exports = {
    createPartner,
};
    
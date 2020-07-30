const UserRole = require('../models/user_role.model');
const Partner = require('../models/partner.model');
const BankAccount = require('../models/bank_account.model');
const bcrypt = require('bcrypt');
const { generateAccountNumber } = require('../utils/util')


require('dotenv').config({
    path: './config/config.env',
});

const changePassword = async (req, res, next) => {
    console.log(req)
    const { oldPassword, newPassword } = req.body
    var user = await UserRole.findOne({ username: "thoaiemployee" })
    console.log(user);
    var salt = await bcrypt.genSalt(10);
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Your password is incorrect"
        })
    }

    let update = {'password': newPassword };
    console.log(hash);
    let resp = await UserRole.updateOne({ user_id: user.user_id }, update);
    console.log(resp);
    if (resp) {
        return res.status(200).json({
            message: "Your password has been updated",
        })
    }
    else {
        return res.status(400).json({
            message: "Can't update your password"
        })
    }

};

const getInfoUser = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    console.log(q);
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    let total = await UserRole.count({ role_code: q.roleCode });
    UserRole.find({ role_code: q.roleCode }, { username: 0, password: 0 }, function (err, users) {
        console.log(users)
        if (users) {
            return res.status(200).json({
                users,
                total
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
}

const updateInfoUser = async (req, res, next) => {
    let userId = req.query.userId;
    const { address, dob, phone } = req.body;
    UserRole.update({ user_id: userId }, { address, dob, phone }, function (err, user) {
        if (user) {
            return res.status(200).json({
                message: "Update succeed",
            })
        }
        else {
            return res.status(400).json({
                message: err
            })
        }
    })
}

const deleteInfoUser = async (req, res, next) => {
    let userId = req.query.userId;
    UserRole.deleteOne({ user_id: userId }, function (err, user) {
        if (user) {
            return res.status(200).json({
                message: "Delete succeed",
            })
        }
        else {
            return res.status(400).json({
                message: err
            })
        }
    })
}

//API create user use bank POST
//Create new user -> create new bank account of user
//Truyền vào body username, password, email, fullName, nickName, phone, identityNumber, address, dob
const createUser = async (req, res, next) => {

    const { username, password, email, fullName, nickName, phone, identityNumber, address, dob, role_code, gender } = req.body;


    if (username == "" || password == "" || fullName == "" || phone == "" || identityNumber == "" || address == "" || dob == null) {
        return res.status(400).json({
            message: "username or passwork invalid"
        })
    }

    let data = {
        username,
        password: password,
        full_name: fullName,
        phone,
        identity_number: identityNumber,
        address,
        dob,
        role_code,
        gender
    };

    if (nickName != "") {
        data["nick_name"] = nickName;
    }

    if (email != "") {
        data["email"] = email;
    }

    let existEmail = await UserRole.findOne({ email });
    if (existEmail != null) {
        return res.status(400).json({
            message: "Existing email",
            errorCode: "EXISTING_EMAIL"
        })
    }

    let existUsername = await UserRole.findOne({ username });
    if (existUsername != null) {
        return res.status(400).json({
            message: "Existing username",
            errorCode: "EXISTING_USERNAME"
        })
    }

    let existIdentityNumber = await UserRole.findOne({ identityNumber });
    if (existIdentityNumber != null) {
        return res.status(400).json({
            message: "Existing identity number",
            errorCode: "EXISTING_IDENTITYNUMBER"
        })
    }

    let user = await UserRole.create(data);

    if (user == null) {
        return res.status(400).json({
            message: "Something wrong with the system",
            errorCode: "BAD_REQUEST"
        })
    }

    if (role_code == "CUSTOMER") {
        let data = {
            type: "STANDARD",
            balance: 0,
            user_id: user.user_id,
            account_number: generateAccountNumber()
        };
        let bankAccount = await BankAccount.create(data)
        if (bankAccount) {
            res.status(200).json({
                message: "Created"
            })
        }
        else res.status(400).json({
            message: "Can't create user"
        })
    }

    res.status(200).json({
        message: "Created"
    })
}

const resetPassword = async (req, res, next) => {
    const { newPassword, confirmPassword } = req.body
    if (newPassword != confirmPassword) {
        return res.status(400).json({
            message: "Your new password is not match"
        })
    }
    else {
        bcrypt.hash(newPassword, salt, async (err, hash) => {
            let update = { 'password': hash };
            let resp = await UserRole.update({ user_id: req.user.user_id }, update);
            if (resp) {
                return res.status(200).json({
                    message: "Your password has been updated",
                })
            }
            else {
                return res.status(400).json({
                    message: "Can't update your password"
                })
            }
        })
    }
}

const getPartnerInfo = async (req, res, next) => {
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    let total = await Partner.count({});
    Partner.find({}, { partner_public_key: 0, partner_secret_key: 0 }, function (err, partners) {
        if (partners.length) {
            return res.status(200).json({
                partners,
                total
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    }).limit(limit ? limit : 20)
        .skip(skip ? skip : 0);
}

module.exports = {
    changePassword,
    getInfoUser,
    createUser,
    resetPassword,
    getPartnerInfo,
    updateInfoUser,
    deleteInfoUser
};
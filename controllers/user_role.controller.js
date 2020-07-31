const UserRole = require('../models/user_role.model');
const Partner = require('../models/partner.model');
const BankAccount = require('../models/bank_account.model');
const bcrypt = require('bcrypt');
const { generateAccountNumber, generatePIN } = require('../utils/util')


require('dotenv').config({
    path: './config/config.env',
});

const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            message: "Invalid input."
        })
    }
    var user = await UserRole.findOne({ username: req.user.username })
    if (!user) {
        return res.status(400).json({
            message: "Something wrong with the system. Try again later."
        })
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
        return res.status(400).json({
            message: "Your password is incorrect"
        })
    }

    const salt = await bcrypt.genSalt(10);
    let password = await bcrypt.hash(newPassword, salt);

    let update = { 'password': password };

    let resp = await UserRole.updateOne({ user_id: user.user_id }, update);
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
    const { address, dob, phone, gender } = req.body;
    let updater = {}
    if (address) {
        updater['address'] = address
    }
    if (dob) {
        updater['dob'] = dob
    }
    if (phone) {
        updater['phone'] = phone
    }
    if (gender) {
        updater['gender'] = gender
    }
    UserRole.update({ user_id: userId }, updater, function (err, user) {
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


const getInfoUserBy = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    var curUser = await BankAccount.findOne({ account_number: q.account_number })
    UserRole.find({ $or: [{ user_id: curUser.user_id }, { username: q.username }] }, { password: 0 }, function (err, user) {
        if (user) {
            return res.status(200).json({
                user
            })
        }
        else {
            return res.status(400).json({
                message: "User not exists"
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
        var currentTime = new Date();
        let data = {
            type: "STANDARD",
            balance: 0,
            user_id: user.user_id,
            account_number: "9700" + identityNumber,
            pin: generatePIN(),
            expired_date: currentTime.setFullYear(currentTime.getFullYear() + 4)
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
    const { email, newPassword } = req.body
    if (!newPassword) {
        return res.status(400).json({
            message: "Invalid password."
        })
    }

    const salt = await bcrypt.genSalt(10);
    let password = await bcrypt.hash(newPassword, salt);
    let updater = { password };
    let resp = await UserRole.update({ 'email': email }, updater);
    if (resp) {
        return res.status(200).json({
            message: "Your password has been updated",
        })
    }

    return res.status(400).json({
        message: "Can't update your password"
    })
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
    deleteInfoUser,
    getInfoUserBy
};
const UserRole = require('../models/user_role.model');
const Partner = require('../models/partner.model');
const bcrypt = require('bcrypt');


require('dotenv').config({
    path: './config/config.env',
});

const changePassword = async(req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    var user = UserRole.findOne({ username: req.user.username })
    console.log(user);
    var salt = await bcrypt.genSalt(10);
    bcrypt.compare(oldPassword, user.toObject().password, function(err, result) {
        if (!result) {
            return res.status(400).json({
                message: "Your password is incorrect"
            })
        }
        else {
            if (newPassword != confirmPassword) {
                return res.status(400).json({
                    message: "Your new password is not match"
                })
            }
            else {
                bcrypt.hash(newPassword, salt, async (err, hash) => {
                    let update = { 'password': hash};
                    console.log(hash);
                    let resp = await UserRole.update({user_id:user.user_id}, update);
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
                })
            }
        }
    });
};

const getInfoUser = async (req, res, next) => {
    let q = JSON.parse(req.query.q);
    console.log(q);
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    let total = await UserRole.count({ role_code: q.roleCode });
    UserRole.find({ role_code: q.roleCode }, {username: 0, password: 0}, function(err, users) {
        console.log(users)
        if (users)
        {
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

//API create user use bank POST
//Create new user -> create new bank account of user
//Truyền vào body username, password, email, fullName, nickName, phone, identityNumber, address, dob
const createUser = async (req, res, next) => {

    const { username, password, email, fullName, nickName, phone, identityNumber, address, dob, role_code } = req.body;
    

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
        role_code
    };

    if (nickName != ""){
        data["nick_name"] = nickName;
    }

    if (email != ""){
        data["email"] = email;
    }

    let existEmail = await UserRole.findOne({ email } );
    if (existEmail != null)
    {
        return res.status(400).json({
            message: "Existing email",
            errorCode: "EXISTING_EMAIL"
        })
    }

    let existUsername = await UserRole.findOne({ username } );
    if (existUsername != null)
    {
        return res.status(400).json({
            message: "Existing username",
            errorCode: "EXISTING_USERNAME"
        })
    }

    let existIdentityNumber = await UserRole.findOne({ identityNumber } );
    if (existIdentityNumber  != null)
    {
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

    res.status(200).json({
        message: "Created"
    })
}

const resetPassword = async(req,res,next) => {
    const { newPassword, confirmPassword } = req.body
    if (newPassword != confirmPassword)
    {
        return res.status(400).json({
            message: "Your new password is not match"
        })
    }
    else
    {
        bcrypt.hash(newPassword, salt, async (err, hash) => {
            let update = {'password': hash};
            let resp = await UserRole.update({user_id:req.user.user_id}, update);
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

const getPartnerInfo = async(req, res, next) => {
    let limit = parseInt(req.query.limit);
    let skip = parseInt(req.query.offset);
    Partner.find({}, {partner_public_key: 0, partner_secret_key: 0}, function(err, partners){
        if (partners.length)
        {
            return res.status(200).json({
                partners
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
    getPartnerInfo
};
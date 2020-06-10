const UserRole = require('../models/user_role.model');
const bcrypt = require('bcrypt');


require('dotenv').config({
    path: './config/config.env',
});

const changePassword = async(req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    // var user = UserRole.findOne({ username: req.user.username }) // Note lại để test
    var user = await UserRole.findOne({ username: "lathoai006" }); 
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
    UserRole.find({ role_id: 5}, {username: 0, password: 0}, function(err, users) { // truyền role id để test
        if (users.length)
        {
            return res.status(200).json({
                users,
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    })
}

//API create user use bank POST
//Create new user -> create new bank account of user
//Truyền vào body username, password, email, fullName, nickName, phone, identityNumber, address, dob
const createUser = async (req, res, next) => {

    const { username, password, email, fullName, nickName, phone, identityNumber, address, dob } = req.body;

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
        role_id: 3
    };

    if (nickName != ""){
        data["nick_name"] = nickName;
    }

    if (email != ""){
        data["email"] = email;
    }

    let user = await UserRole.create(data);

    if (user == null) {
        return res.status(400).json({
            message: "Can't create user"
        })
    }

    res.status(200).json({
        message: "Created"
    })
}

module.exports = {
    changePassword, 
    getInfoUser, 
    createUser 
};
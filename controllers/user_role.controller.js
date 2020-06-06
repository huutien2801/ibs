const UserRole = require('../models/user_role.model');
const bcrypt = require('bcrypt');


require('dotenv').config({
    path: './config/config.env',
});

const changePassword = async(req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    var user = UserRole.findOne({ username: req.user.username }) // Token

    const salt = await bcrypt.genSalt(10);
    bcrypt.hash(oldPassword, salt, function(err, hash) {
        if (bcrypt.compare(user.select('password'), hash, function(res, err) {
            if (!res) {
                return res.status(400).json({
                    message: "Your password is incorrect"
                })
            }
        }));
    })

    if (newPassword != confirmPassword)
    {
        return res.status(400).json({
            message: "Your new password is not match"
        })
    }
    else
    {
        bcrypt.hash(newPassword, salt, function(err, hash) {
            const update = { password: hashNewPassword, updated_date: Date.now };
            let resp = user.update(update);
            if (resp) {
                return res.status(200).json({
                    message: "Your password has been updated",
                    status: 200
                })
            }
            else {
                return res.status(400).json({
                    message: "Can't update your password"
                })
            }
        })
    }
};

const getAllUsers = async (req, res, next) => {
    UserRole.find({ role_id: 2}, {username: 0, password: 0}, function(err, users) { // truyền role id
        if (users)
        {
            return res.status(200).json({
                users,
                status: 200
            })
        }
        else {
            return res.status(400).json({
                message: "Empty list"
            })
        }
    })
}

module.exports = {
    changePassword,
    getAllUsers,
};
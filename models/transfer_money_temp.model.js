const mongoose = require("mongoose");
require('dotenv').config({
    path: 'config/config.env'
});

const transferMoneyTempSchema = mongoose.Schema(
	{
        sender_user_id: {
            type: Number,
            required: true
        },
        receiver_account_number: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        message: {
            type: String,
        },
        fee_type: {
            type: String,
        },
        partner_code: {
            type: String,
        },
		created_at: {
            type: Date,
            default: Date.now
        }
	}
);

module.exports = mongoose.model("transferMoneyTemp", transferMoneyTempSchema);
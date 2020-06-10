const mongoose = require("mongoose");
require('dotenv').config({
    path: 'config/config.env'
});

const otpSchema = mongoose.Schema(
	{
		email: { type: String },
		otp: { type: Number }
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("Otp", otpSchema);
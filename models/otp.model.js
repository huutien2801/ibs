const mongoose = require("mongoose");
require('dotenv').config({
    path: 'config/config.env'
});

const otpSchema = mongoose.Schema(
	{
		email: { type: String },
		otp: { type: Number },
		createdAt: { type: Date, expires: 18000 }
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("Otp", otpSchema);
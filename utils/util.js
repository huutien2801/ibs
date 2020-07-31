
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "lathoai3107@gmail.com",
      pass: "Lathoai1311",
    },
});

function generateAccountNumber() {
  return ""
}

function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000);
}

function generateOTP() {
  return generatePIN()
}

function sendOTPMail(email, fullname, otpCode) {
  var mailOptions = {
    from: "lathoai3107@gmail.com",
    to: email,
    subject: "Verify OTP email",
    text: "Dear " + fullname +"\n\nYou have just placed an request at our bank. This is your verification code:\n" + otpCode.toString() + "\nIf you did not make this request, you can ignore this email.",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return {status: "ERROR", message: "Can't sen't message at this time. " + error}
    } else {
      return {status: "OK", message: "Send email successful" + info.response}
    }
  });
  return {status: "ERROR", message: "Can't send otp."}
}

module.exports = {
    generateAccountNumber,
    generatePIN,
    generateOTP,
    sendOTPMail,
    FEE_TRANSFER: 1100,
    FEE_TRANSFER_BANK: 3300,
    STANDARD_ACCOUNT: "STANDARD",
    DEPOSIT_ACCOUNT: "DEPOSIT",
    EXCHANGE_TYPE_ALL: "ALL",
    EXCHANGE_TYPE_SEND: "SEND",
    EXCHANGE_TYPE_RECEIVE: "RECEIVE",
    EXCHANGE_TYPE_DEBT: "DEBT"
};
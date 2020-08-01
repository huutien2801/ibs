
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "lathoai3107@gmail.com",
      pass: "Lathoai1311",
    },
});

function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000);
}

function generateOTP() {
  return generatePIN()
}

function sendOTPMail(email, fullname, otpCode) {
  var mailOptions = {
    from: "3TBank",
    to: email,
    subject: "Email xác nhận mã PIN",
    text: "Kính gửi " + fullname +",\n\nBạn vừa giao dịch tại ngân hàng chúng tôi. Đây là mã xác nhận của bạn:\n" + otpCode.toString() + "\nNếu như bạn không thực hiện giao dịch này, bạn có thể bỏ qua email này.",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error != "null") {
      return {status: "ERROR", message: "Can't sen't message at this time. " + error}
    }
  });
  return {status: "OK", message: "Send email successful"}
}

module.exports = {
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
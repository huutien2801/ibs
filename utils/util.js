
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

function generateAccountNumber() {
  var now = new Date();

  timestamp = now.getFullYear().toString(); // 2011
  timestamp += (now.getMonth < 9 ? '0' : '') + now.getMonth().toString(); 
  timestamp += ((now.getDate < 10) ? '0' : '') + now.getDate().toString();
  timestamp += now.getUTCMilliseconds();

  return timestamp 
}

function sendOTPMail(email, fullname, otpCode) {
  var mailOptions = {
    from: "lathoai3107@gmail.com",
    to: email,
    subject: "Email xác nhận mã PIN",
    text: "Kính gửi " + fullname + ",\n\nĐây là mã giao dịch của bạn:\n" + otpCode.toString() + "\nMã giao dịch sẽ hết hạn trong vòng 2 phút.\nNếu như bạn không thực hiện giao dịch này, bạn có thể bỏ qua email này.",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return { status: "ERROR", message: "Can't sen't message at this time. " + error }
    }
  });
  return { status: "OK", message: "Send email successful" }
}

module.exports = {
  generatePIN,
  generateOTP,
  sendOTPMail,
  generateAccountNumber,
  FEE_TRANSFER: 1000,
  FEE_TRANSFER_BANK: 3000,
  STANDARD_ACCOUNT: "STANDARD",
  DEPOSIT_ACCOUNT: "DEPOSIT",
  EXCHANGE_TYPE_ALL: "ALL",
  EXCHANGE_TYPE_SEND: "SEND",
  EXCHANGE_TYPE_RECEIVE: "RECEIVE",
  EXCHANGE_TYPE_DEBT: "DEBT"
};
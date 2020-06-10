var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "thompsongold31@gmail.com",
      pass: "Hackintosh123",
    },
});

function generateAccountNumber() {
  var current = new Date();
  //Năm 1 số
  var y = current.getFullYear() % 1000;
  //tháng 2 số
  var m = current.getMonth();
  //Ngày 2 số
  var d = current.getDay();
  //Giờ 2 số
  var h = current.getHours();
  //Phút 2 số
  var mn = current.getMinutes();
  //Giây 2 số
  var s = current.getSeconds();
  //ms 2 số
  var n = current.getMilliseconds() % 100;

  return y + m + d + h + mn + s + n;
}

function generatePIN() {
  return Math.floor(1000 + Math.random() * 9000);
}

function generateOTP() {
  var current = new Date();
  var s = current.getSeconds();
  //ms 2 số
  var n = current.getMilliseconds() % 100;
  return parseInt(s + n);
}

function sendOTPMail(email, fullname, otpCode) {
  var mailOptions = {
    from: "thompsongold31@gmail.com",
    to: email,
    subject: "Verify OTP email",
    text: "Dear" + fullname +"\n\nYou have just placed an request at our bank. This is your verification code:\n" + otpCode.toString() + "\nIf you did not make this request, you can ignore this email.",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return {status: "ERROR", message: "Can't sen't message at this time. " + error}
    } else {
      return {status: "OK", message: "Send email successful"}
    }
  });
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
};

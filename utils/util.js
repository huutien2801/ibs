function generateAccountNumber(){
    var current = new Date();
    //Năm 1 số
    var y = current.getFullYear()%1000;
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
    var n = current.getMilliseconds()%100;

    return y + m + d + h + mn + s + n;
}

function generatePIN(){
    return Math.floor(1000 + Math.random() * 9000);
}

module.exports = {
    generateAccountNumber,
    generatePIN,
    FEE_TRANSFER: 1100,
    FEE_TRANSFER_BANK: 3300,
    STANDARD_ACCOUNT: "STANDARD",
    DEPOSIT_ACCOUNT: "DEPOSIT",
};
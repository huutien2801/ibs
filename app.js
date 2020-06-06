const express = require("express")
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const db = require('./db');
const app = express();
const fs = require("fs");
const md5 = require('md5');
// Load env vars
dotenv.config({ path: './config/config.env' });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect DB
(async () => {
  try {
    const dbInfo = await db.connectDB(process.env.MONGO_URI);
    if (dbInfo) {
      console.log(`Connected to MongoDB successfully ${dbInfo.connection.host}`)
    }
  } catch (error) {
    console.log(`Connected to DB failed ${error}`)
  }
})();

//RSA
const NodeRSA = require('node-rsa');

// let keyPublicStr = "-----BEGIN PUBLIC KEY-----\n" +
//   "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL5t2Sxzw8uXW0eWPlfRWUNrF0y2JbjB\n" +
//   "5XzusIiUtPo+zSmrMByrjMlIEEdX7sZct/zANGhsrrRovSMKV7EkoKkCAwEAAQ==\n" +
//   "-----END PUBLIC KEY-----"
// let keyPrivateStr = "-----BEGIN RSA PRIVATE KEY-----" +
//   "MIIBOwIBAAJBAL5t2Sxzw8uXW0eWPlfRWUNrF0y2JbjB5XzusIiUtPo+zSmrMByr\n" +
//   "jMlIEEdX7sZct/zANGhsrrRovSMKV7EkoKkCAwEAAQJBALJcoTWJmLJwqgZ7KxmF\n" +
//   "9F25SLGJSfurYQ+LYb4Lyxc3bRmHqKH/CuenKf9MOZ9nVs0Wwt+4UjdsCD7wE+JS\n" +
//   "OaECIQDpxo/kw3PrVycMD6bXtX8FkPDgkJvzy1pXZgUEEfS7JwIhANCIWqSfe5J4\n" +
//   "jz5Pa7kZM/Mg2gmU6GB+5m3VV3TXlGevAiEAyOQHN3D2pmBof6bbmzauhxv8wx3B\n" +
//   "xokTg1N6L/s2MbUCID6cQgLdc3+1vORreh94JrXf7jckQ2T9lPfzLzAArik3AiAc\n" +
//   "j3rbSsZDYdfJF+7Y1lsKCHDeRByHs5oLed6S9F0UBMQ==\n" +
//   "-----END RSA PRIVATE KEY-----"
const keyPublic = new NodeRSA(process.env.RSA_PUBLIC_KEY)
const keyPrivate = new NodeRSA(process.env.RSA_PRIVATE_KEY)

// const { keys: [privateKey] } = await openpgp.key.readArmored(ourPrivateKey)
// await privateKey.decrypt(passphrase)

// let { data: digitalSignature } = await openpgp.sign({
//   message: openpgp.cleartext.fromText(accountId), // CleartextMessage or Message object
//   privateKeys: [privateKey]                             // for signing
// });

let currentDate = new Date()
let secondCurrentDate = currentDate.getTime()
console.log(secondCurrentDate)

let hashSecretKey = md5("dungnoiaihet")
let body = {
  accountId: 123456789,
  cost: 5
}
let hashStr = md5(body + secondCurrentDate + hashSecretKey)

console.log(hashStr)

let sign = keyPrivate.sign(body, "base64", "base64");
console.log("Sign: ", sign)
let a = keyPublic.verify(body, sign, "base64", "base64")
// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

//apply to all requests
app.use(limiter);

//Routes
app.use('/api/v1/auth', require('./routers/auth.router'));
app.use('/api/v1/user', require('./routers/user.router'));
app.use('/api/v1/partner', require('./routers/partner.router'));
//app.use('/api/v1/bank-account', require('./routers/bank_account.router'));

app.use('*', (req, res) => {
  res.status(200).send({
    message: 'Welcome to Internet Banking Service',
  });
});

const errorHandler = require('./middlewares/error-handler');
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`)
})

module.exports = app;
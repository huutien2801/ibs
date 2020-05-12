const express = require("express")
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const db = require('./db');
const app = express();

// Load env vars
dotenv.config({ path: './config/config.env' });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect DB
(async () => {
  try {
    const dbInfo = await db.connectDB(process.env.MONGO_URI);
    if (dbInfo) {
      console.log( `Connected to MongoDB successfully ${dbInfo.connection.host}`)
    }
  } catch (error) {
    console.log(`Connected to DB failed ${error}`)
  }
})();

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

app.use('*', (req, res) => {
  res.status(200).send({
    message: 'Welcome to Internet Banking Service',
  });
});

const errorHandler = require('./middlewares/error-handler');
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT,()=>{
    console.log(`API running on port ${PORT}`)
})

module.exports = app;
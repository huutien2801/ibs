const mongoose = require('mongoose');

const connectDB = async (connectStr) => {
    try {
        const db = await mongoose.connect(connectStr, {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        return db;
    } catch (error) {
        // logger.info(error);
        console.log(`failed: ${error}`)
        return null;
    }

};

module.exports = {
    connectDB
};
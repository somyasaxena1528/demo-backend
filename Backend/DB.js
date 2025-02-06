const mongoose = require('mongoose');
require("dotenv").config();
const mongoURI = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        });
        console.log('DB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
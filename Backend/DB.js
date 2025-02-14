require("dotenv").config();
const mongoose = require('mongoose');
const mongoURI = process.env.MONGO;

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
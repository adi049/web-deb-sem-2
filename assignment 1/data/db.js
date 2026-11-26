const mongoose = require('mongoose');

async function connectDB() {
    try{
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("MongoDB connected");
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}
// connectDB();

module.exports = connectDB;
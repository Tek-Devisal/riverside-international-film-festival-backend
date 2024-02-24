const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Mongodb connected at: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDatabase;

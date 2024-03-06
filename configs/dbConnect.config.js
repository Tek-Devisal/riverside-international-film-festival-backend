const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {dbName:'riverside', useNewUrlParser: true,
    writeConcern: {
      w: 1 // This sets the write concern to 1
    }});
    console.log(`Mongodb connected at: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectToDatabase;

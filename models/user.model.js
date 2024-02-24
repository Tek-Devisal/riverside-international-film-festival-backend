const mongoose = require("mongoose");
const { encryptionAndPasswordComp } = require("../configs/encryption.config");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      trim: true,
      default: 'user',
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

encryptionAndPasswordComp(userSchema);

module.exports = mongoose.model("User", userSchema);

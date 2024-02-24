const bcrypt = require("bcrypt");

function encryptionAndPasswordComp(Schema) {
  //Encrypting password before saving
  Schema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

  //Comparing entered password to password in database
  Schema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
}

module.exports = { encryptionAndPasswordComp };

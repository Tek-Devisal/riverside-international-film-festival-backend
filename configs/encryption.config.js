const bcrypt = require("bcrypt");

function encryptionAndPasswordComp(Schema) {
  //ENCRYPTING PASSWORD BEFORE SAVING
  Schema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    const salt =  bcrypt.genSaltSync(10);
    this.password =  bcrypt.hash(this.password, salt);
  });

  //COMPARING ENTERED PASSWORD TO PASSWORD IN DATABASE
  Schema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
}

module.exports = { encryptionAndPasswordComp };

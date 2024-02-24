const mongoose = require("mongoose");

const mongodbIdValidator = (id) => {
  const valid = mongoose.Types.ObjectId.isValid(id);
  if (!valid) throw new Error("This ID is not a valid MongoDB ID.");
};

module.exports = mongodbIdValidator;

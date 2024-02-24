const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
      unique: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    quantity: Number,
    price: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);

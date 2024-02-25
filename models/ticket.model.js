const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

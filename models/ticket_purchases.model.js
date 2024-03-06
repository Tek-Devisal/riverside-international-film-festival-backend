const mongoose = require("mongoose");

const ticketPurchasesSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
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

module.exports = mongoose.model("Ticket_Purchases", ticketPurchasesSchema);

const Ticket = require("../models/ticket.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config.js");
const { creator } = require("../middlewares/auth.middleware.js");
const ticket_purchasesModel = require("../models/ticket_purchases.model.js");

/*******************************************************************
 * Purchase A TICKET
 *  ******************************************************************/
const purchaseTicket = asyncHandler(async (req, res) => {
  try {
    const { quantity, price, movieId, scheduleId, buyerId } = req.body;

    // Required fields check
    if (!quantity || !price || !scheduleId || !movieId) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }
    
    // Find the ticket by movieId and scheduleId to check quantity
    const ticket = await Ticket.findOne({ movieId, scheduleId });

    // Check if the ticket exists and has more than 0 quantity
    if (!ticket || ticket.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Ticket not available!",
      });
    }

    // Proceed only if the quantity to purchase does not exceed the available quantity
    if (quantity > ticket.quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient ticket quantity available!",
      });
    }

    // Check if a ticket purchase already exists for this movieId - assuming each buyer can only purchase once per movieId and scheduleId
    const existingPurchase = await ticket_purchasesModel.findOne({ movieId, buyerId, scheduleId });
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "Purchase for this ticket already exists!",
      });
    }

    const ticketId = ticket._id;
    console.log(ticketId);

    // Create new ticket purchase
    await new ticket_purchasesModel({
      buyerId,
      ticketId,
      scheduleId,
      quantity,
      price
    }).save();

    // Decrement the ticket quantity in the TicketsModel
    ticket.quantity -= quantity;
    await ticket.save();

    // Send a success message
    res.status(200).json({
      success: true,
      message: "Ticket purchased successfully!",
    });
  } catch (error) {
    console.error("Purchase Ticket Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
});



/*******************************************************************
 * VIEW TICKETS BY BUYER ID
 * ******************************************************************/
const fetchTicketsByBuyerId = asyncHandler(async (req, res) => {
  try {
    const { buyerId } = req.params; // Assuming buyerId is passed as a URL parameter
    console.log(buyerId);

    // Validate MongoDB ID format for buyerId
    mongodbIdValidator(buyerId);

    // Fetch tickets and populate buyer and movie details
    // Assuming ticketId itself directly references a Movie document or contains a movieId field that does
    const tickets = await ticket_purchasesModel.find({ buyerId: buyerId })
      .populate('buyerId', 'username email role') // Populate the ticket buyer details
      .populate({
        path: 'ticketId',
        populate: {
          path: 'movieId', // Assuming ticketId contains a movieId field that references the Movie
          model: 'Movie', // Specify the model if it's not automatically inferred
          populate: [ // Nested populate for movie details like likes, dislikes, and ratings if necessary
            { path: 'creatorId', select: 'username email' }, // Assuming you have a creator for the movie
            { path: 'likes', select: 'username' },
            { path: 'dislikes', select: 'username' },
            { path: 'ratings.userId', select: 'username rating' }
          ]
        }
      });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tickets found for the provided buyer ID",
      });
    }

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});



module.exports = {
  purchaseTicket,
  fetchTicketsByBuyerId
};

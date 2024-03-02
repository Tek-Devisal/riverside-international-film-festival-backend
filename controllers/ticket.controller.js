const Ticket = require("../models/ticket.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");

/*******************************************************************
 * CREATE A TICKET
 *  ******************************************************************/
const createTicket = asyncHandler(async (req, res) => {
  try {
    const { price, movieId, scheduleId } = req.body;
    const creatorId = req.user._id;

    //REQUIRED FIELDS
    if (!price || !scheduleId || !movieId) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //VALIDATE MONGODB ID
    mongodbIdValidator(creatorId);

    //CHECK IF TICKET ALREADY EXIST
    if (await Ticket.findOne({ movieId }))
      return res.status(400).json({
        success: false,
        message: "Ticket already exists!",
      });

    //CREATE NEW TICKET
    new Ticket({
      creatorId,
      price,
      movieId,
      scheduleId,
    }).save();

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Ticket added successfully!",
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/*******************************************************************
 * EDIT A TICKET
 *  ******************************************************************/
const editTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { price, scheduleId } = req.body;
    const creatorId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(creatorId);

    const ticket = await Ticket.findById(id);

    if (ticket.creatorId !== creatorId) {
      return res.status(400).json({
        success: false,
        message: "You are not the creator of this ticket!",
      });
    }

    //UPDATE A TICKET
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      {
        price,
        scheduleId,
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(400).json({
        success: false,
        message: "Ticket do not exist!",
      });
    }

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Ticket updated!",
      data: updatedTicket,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * DELETE A TICKET
 *  ******************************************************************/
const deleteTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const creatorId = req.user._id;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);
    mongodbIdValidator(creatorId);

    const ticket = await Ticket.findById(id);

    if (ticket.creatorId !== creatorId) {
      return res.status(400).json({
        success: false,
        message: "You are not the creator of this ticket!",
      });
    }
    //DELETE A TICKET
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(400).json({
        success: false,
        message: "Ticket do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully!",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW A TICKET
 *  ******************************************************************/
const viewTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(400).json({
        success: false,
        message: "Ticket do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW ALL TICKET
 * ******************************************************************/
const viewAllTicket = asyncHandler(async (req, res) => {
  try {
    const tickets = await Ticket.find();

    if (tickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There is no tickets stored yet!",
      });
    }

    res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = {
  createTicket,
  editTicket,
  deleteTicket,
  viewTicket,
  viewAllTicket,
};

const Ticket = require("../models/ticket.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");
const { creator } = require("../middlewares/auth.middleware.js");

/*******************************************************************
 * CREATE A TICKET
 *  ******************************************************************/
const createTicket = asyncHandler(async (req, res) => {
  try {
    // console.log(res.quantity);
    const { quantity, price, movieId, scheduleId, creatorId } = req.body;

    //REQUIRED FIELDS
    if (!quantity || !price || !scheduleId || !movieId) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //CHECK IF TICKET ALREADY EXIST
    if (await Ticket.findOne({ movieId }))
      return res.status(400).json({
        success: false,
        message: "Ticket already exists!",
      });

    //CREATE NEW TICKET
    const result = Ticket.create({...req.body});

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Ticket added successfully!",
      data:[
        {
          "_id": "65ea6afb5efd00ce63c8baf9",
          "buyerId": {
            "_id": "65e3cfef9c171b9f63d2c9a3",
            "username": "janim2",
            "email": "iamjesse75@gmail.com",
            "role": "creator"
          },
          "ticketId": {
            "_id": "65ea6ccda72a0ce97cc7d329",
            "creatorId": "65e3cfef9c171b9f63d2c9a3",
            "movieId": {
              "thumbnail": {
                "filename": "avengers.jpg",
                "contentType": "application/octet-stream"
              },
              "_id": "65e900fd86be09d6198d886c",
              "creatorId": {
                "_id": "65e3cfef9c171b9f63d2c9a3",
                "username": "janim2",
                "email": "iamjesse75@gmail.com"
              },
              "name": "Avengers",
              "genre": "action",
              "duration": "20",
              "releasedDate": "2023",
              "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
              "likes": [],
              "dislikes": [],
              "cast": [],
              "ratings": [],
              "createdAt": "2024-03-06T23:49:17.708Z",
              "updatedAt": "2024-03-06T23:49:17.708Z",
              "__v": 0
            },
            "scheduleId": "65e9ddaf0229f628fb9fc6d6",
            "quantity": 100,
            "price": 10,
            "createdAt": "2024-03-08T01:41:33.883Z",
            "updatedAt": "2024-03-08T01:41:33.883Z",
            "__v": 0
          },
          "scheduleId": "65e9ddaf0229f628fb9fc6d6",
          "quantity": 1,
          "price": 250,
          "createdAt": "2024-03-08T01:33:47.070Z",
          "updatedAt": "2024-03-08T01:33:47.070Z",
          "__v": 0
        }
      ]
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
    const { quantity, price, movieId, scheduleId } = req.body;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    //UPDATE A TICKET
    const update = await Ticket.findByIdAndUpdate(
      id,
      {
        quantity,
        price,
        scheduleId,
      },
      { new: true }
    );

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "Ticket do not exist!",
      });
    }

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Ticket updated!",
      data: update,
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

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    const ticket = await Ticket.findByIdAndDelete(id);

    if (!ticket) {
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
    // Fetch tickets and populate creator and movie details
    const tickets = await Ticket.find()
    .populate('creatorId', 'username email role') // Populate the ticket creator details
    .populate({
      path: 'movieId', // Populate the movie details
      populate: [
        { path: 'creatorId', select: 'username email' }, // Populate the movie creator's details
        { path: 'likes', select: 'username' }, // Populate the users who liked the movie
        { path: 'dislikes', select: 'username' }, // Populate the users who disliked the movie
        { path: 'ratings.userId', select: 'username rating' }, // Populate the ratings along with the user details
      ]
    });

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

/*******************************************************************
 * VIEW TICKETS BY CREATOR ID
 * ******************************************************************/
const fetchTicketsByCreatorId = asyncHandler(async (req, res) => {
  try {
    const { creatorId } = req.params; // Assuming creatorId is passed as a URL parameter

    // Validate MongoDB ID format for creatorId
    mongodbIdValidator(creatorId);

    // Fetch tickets and populate creator and movie details
    const tickets = await Ticket.find({ creatorId: creatorId })
      // .populate('creatorId', 'username email role') // Populate the ticket creator details
      // .populate({
      //   path: 'movieId', // Populate the movie details
      //   populate: [
      //     { path: 'creatorId', select: 'username email' }, // Populate the movie creator's details
      //     { path: 'likes', select: 'username' }, // Populate the users who liked the movie
      //     { path: 'dislikes', select: 'username' }, // Populate the users who disliked the movie
      //     { path: 'ratings.userId', select: 'username rating' } // Populate the ratings along with the user details
      //   ]
      // });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tickets found for the provided creator ID",
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


/*******************************************************************
 * VIEW TICKETS BY MOVIE ID AND SCHEDULE
 * ******************************************************************/
const fetchByMovieAndSchedule = asyncHandler(async (req, res) => {
  try {
    const { movieId,scheduleId } = req.body; // Assuming creatorId is passed as a URL parameter

    // console.log(movieId, scheduleId)
    // Validate MongoDB ID format for creatorId
    // mongodbIdValidator(movieId, scheduleId);

    // Fetch tickets and populate creator and movie details
    const tickets = await Ticket.find({ movieId: movieId, scheduleId: scheduleId })
      // .populate('creatorId', 'username email role') // Populate the ticket creator details
      // .populate({
      //   path: 'movieId', // Populate the movie details
      //   populate: [
      //     { path: 'creatorId', select: 'username email' }, // Populate the movie creator's details
      //     { path: 'likes', select: 'username' }, // Populate the users who liked the movie
      //     { path: 'dislikes', select: 'username' }, // Populate the users who disliked the movie
      //     { path: 'ratings.userId', select: 'username rating' } // Populate the ratings along with the user details
      //   ]
      // });

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No tickets found for the provided movie ID and schedule",
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
  createTicket,
  editTicket,
  deleteTicket,
  viewTicket,
  viewAllTicket,
  fetchTicketsByCreatorId,
  fetchByMovieAndSchedule
};

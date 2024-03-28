const express = require("express");
const router = express.Router();

const {
  createTicket,
  editTicket,
  deleteTicket,
  viewTicket,
  viewAllTicket,
  fetchTicketsByCreatorId,
  fetchByMovieAndSchedule
} = require("../controllers/ticket.controller");
const { authenticate, creator } = require("../middlewares/auth.middleware");
const { purchaseTicket, fetchTicketsByBuyerId } = require("../controllers/ticket_purchases.controller");

//Post routes
router.post("/add", authenticate, creator, createTicket);
router.post("/purchaseTicket", authenticate, purchaseTicket);
router.post("/fetchByMovieAndSchedule", authenticate, fetchByMovieAndSchedule);

//Get routes
router.get("/:id", authenticate, viewTicket);
router.get("/", authenticate, viewAllTicket);
router.get('/fetchTicketByCreatorId/:creatorId', authenticate, fetchTicketsByCreatorId);
router.get('/fetchTicketsByBuyerId/:buyerId', authenticate, fetchTicketsByBuyerId);

//Put routes
router.put("/update/:id", authenticate, creator, editTicket);

//Delete routes
router.delete("/delete/:id", authenticate, creator, deleteTicket);

module.exports = router;

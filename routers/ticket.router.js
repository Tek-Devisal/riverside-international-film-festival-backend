const express = require("express");
const router = express.Router();

const {
  createTicket,
  editTicket,
  deleteTicket,
  viewTicket,
  viewAllTicket,
} = require("../controllers/ticket.controller");
const { authenticate, creator } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", authenticate, creator, createTicket);

//Get routes
router.get("/:id", authenticate, viewTicket);
router.get("/", authenticate, viewAllTicket);

//Put routes
router.put("/update/:id", authenticate, creator, editTicket);

//Delete routes
router.delete("/delete/:id", authenticate, creator, deleteTicket);

module.exports = router;

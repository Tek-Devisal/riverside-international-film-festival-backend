const express = require("express");
const router = express.Router();

const {
  createTicket,
  editTicket,
  deleteTicket,
  viewTicket,
  viewAllTicket,
} = require("../controllers/ticket.controller");
const { authenticate } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", createTicket);

//Get routes
router.get("/:id", viewTicket);
router.get("/", viewAllTicket);

//Put routes
router.put("/update", authenticate, editTicket);

//Delete routes
router.post("/delete", deleteTicket);

module.exports = router;

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
router.post("/add", authenticate, createTicket);

//Get routes
router.get("/:id", authenticate, viewTicket);
router.get("/", authenticate, viewAllTicket);

//Put routes
router.put("/update/:id", authenticate, editTicket);

//Delete routes
router.delete("/delete/:id", authenticate, deleteTicket);

module.exports = router;

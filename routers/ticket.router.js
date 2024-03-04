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

//POST ROUTES
router.post("/add", authenticate, creator, createTicket);

//GET ROUTES
router.get("/:id", authenticate, viewTicket);
router.get("/", authenticate, viewAllTicket);

//PUT ROUTES
router.put("/update/:id", authenticate, creator, editTicket);

//DELETE ROUTES
router.delete("/delete/:id", authenticate, creator, deleteTicket);

module.exports = router;

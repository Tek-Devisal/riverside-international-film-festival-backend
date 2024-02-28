const express = require("express");
const router = express.Router();

const {
  createSchedule,
  editSchedule,
  deleteSchedule,
  viewSchedule,
  viewAllSchedule,
} = require("../controllers/schedule.controller");
const { authenticate } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", authenticate, createSchedule);

//Get routes
router.get("/:id", authenticate, viewSchedule);
router.get("/", authenticate, viewAllSchedule);

//Put routes
router.put("/update/:id", authenticate, editSchedule);

//Delete routes
router.delete("/delete/:id", authenticate, deleteSchedule);

module.exports = router;

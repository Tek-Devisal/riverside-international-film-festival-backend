const express = require("express");
const router = express.Router();

const {
  createSchedule,
  editSchedule,
  deleteSchedule,
  viewSchedule,
  viewAllSchedule,
  byDaySchedule,
} = require("../controllers/schedule.controller");
const { authenticate, creator } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", authenticate, creator, createSchedule);

//Get routes
router.get("/:id", authenticate, viewSchedule);
router.get("/", authenticate, viewAllSchedule);
router.post("/fetchScheduleByDay", authenticate, byDaySchedule);

//Put routes
router.put("/update/:id", authenticate, creator, editSchedule);

//Delete routes
router.delete("/delete/:id", authenticate, creator, deleteSchedule);

module.exports = router;

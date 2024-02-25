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
router.post("/add", createSchedule);

//Get routes
router.get("/:id", viewSchedule);
router.get("/", viewAllSchedule);

//Put routes
router.put("/update/:id", authenticate, editSchedule);

//Delete routes
router.post("/delete/:id", deleteSchedule);

module.exports = router;

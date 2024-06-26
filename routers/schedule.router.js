const express = require("express");
const router = express.Router();

const {
  createSchedule,
  editSchedule,
  deleteSchedule,
  viewSchedule,
  viewAllSchedule,
  viewScheduleByCreator,
  byDaySchedule,
  viewAnyFromSchedules,
  updateSchedulesTimezone
} = require("../controllers/schedule.controller");
const { authenticate, creator } = require("../middlewares/auth.middleware");

//Post routes
router.post("/add", authenticate, creator, createSchedule);
router.post("/fetchScheduleByDay", authenticate, byDaySchedule);
router.post("/viewAnyFromSchedules", authenticate, viewAnyFromSchedules);
router.post("/updateSchedulesTimezone", authenticate, updateSchedulesTimezone);

//Get routes
router.get("/:id", authenticate, viewSchedule);
router.get("/", authenticate, viewAllSchedule);
router.get("/fetchByCreator/:creatorId", authenticate, viewScheduleByCreator);

//Put routes
router.put("/update/:id", authenticate, creator, editSchedule);

//Delete routes
router.delete("/delete/:id", authenticate, creator, deleteSchedule);

module.exports = router;

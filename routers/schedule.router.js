const express = require("express");
const router = express.Router();

const {
  createSchedule,
  editSchedule,
  deleteSchedule,
  viewSchedule,
  viewAllSchedule,
} = require("../controllers/schedule.controller");
const { authenticate, creator } = require("../middlewares/auth.middleware");

//POST ROUTES
router.post("/add", authenticate, creator, createSchedule);

//GET ROUTES
router.get("/:id", authenticate, viewSchedule);
router.get("/", authenticate, viewAllSchedule);

//PUT ROUTES
router.put("/update/:id", authenticate, creator, editSchedule);

//DELETE ROUTES
router.delete("/delete/:id", authenticate, creator, deleteSchedule);

module.exports = router;

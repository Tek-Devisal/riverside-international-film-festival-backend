const Schedule = require("../models/schedule.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");


const viewSchedules = asyncHandler(async (req, res) => {
  try {
    // Extract all fields from request body
    const query = req.body;

    // If the query is empty, fetch all schedules, otherwise fetch schedules based on query
    const schedules = query && Object.keys(query).length > 0 
      ? await Schedule.find(query) 
      : await Schedule.find();

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No schedules found!",
      });
    }

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



module.exports = {
  viewSchedules
};

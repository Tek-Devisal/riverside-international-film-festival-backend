const Schedule = require("../models/schedule.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");
const ticket_purchasesModel = require("../models/ticket_purchases.model.js");

/*******************************************************************
 * CREATE A SCHEDULE
 *  ******************************************************************/
const createSchedule = asyncHandler(async (req, res) => {
  try {
    const { location, time, date, movieId, creatorId } = req.body;

    //REQUIRED FIELDS
    if (!location || !time || !date) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //CHECK IF SCHEDULE ALREADY EXIST
    // if (await Schedule.findOne({ movieId }))
    //   return res.status(400).json({
    //     success: false,
    //     message: "Schedule already exists!",
    //   });

    //CREATE NEW SCHEDULE
    const result =  await Schedule.create({...req.body});

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Schedule added successfully!",
      data: result
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/*******************************************************************
 * EDIT A SCHEDULE
 *  ******************************************************************/
const editSchedule = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { location, time, date } = req.body;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    //UPDATE A SCHEDULE
    const update = await Schedule.findByIdAndUpdate(
      id,
      {
        location,
        time,
        date,
      },
      { new: true }
    );

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "Schedule do not exist!",
      });
    }

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Schedule updated!",
      data: update,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * DELETE A SCHEDULE
 *  ******************************************************************/
const deleteSchedule = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Schedule do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully!",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW A SCHEDULE
 *  ******************************************************************/
const viewSchedule = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    //VALIDATE MONGODB ID
    mongodbIdValidator(id);

    const schedule = await Schedule.findById(id);

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Schedule do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW ALL SCHEDULE
 * ******************************************************************/
const viewAllSchedule = asyncHandler(async (req, res) => {
  try {
    const schedules = await Schedule.find();

    if (schedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There is no schedules stored yet!",
      });
    }

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VIEW A SCHEDULE BY A CREATOR
 *  ******************************************************************/
const viewScheduleByCreator = asyncHandler(async (req, res) => {
  try {
    const { creatorId } = req.params;

    //VALIDATE MONGODB ID
    mongodbIdValidator(creatorId);

    console.log(creatorId);

    const schedule = await Schedule.findOne({creatorId});

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: "Schedule do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      data: [schedule],
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

const viewAnyFromSchedules = asyncHandler(async (req, res) => {
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

const byDaySchedule = asyncHandler(async (req, res) => {
  try {
    const { day } = req.body; // Assume day is passed as 0 (Sunday) to 6 (Saturday), and 10 for all days

    // Fetch all schedules and populate movie details
    const schedules = await Schedule.find().populate('movieId');

    // Filter schedules based on the specified day, unless day is 10 which fetches all schedules
    const filteredSchedules = schedules.filter(schedule => {
      if (day === 10) {
        // If day is 10, return true for all schedules to include all schedules
        return true;
      } else {
        // Otherwise, filter by the specified day
        const scheduleDate = new Date(schedule.date);
        return scheduleDate.getDay() === day;
      }
    });

    // Respond with filtered schedules
    res.status(200).json({
      success: true,
      data: filteredSchedules,
    });
  } catch (error) {
    console.error("Failed to fetch schedules by day:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});


module.exports = {
  createSchedule,
  editSchedule,
  deleteSchedule,
  viewSchedule,
  viewAllSchedule,
  viewScheduleByCreator,
  byDaySchedule,
  viewAnyFromSchedules
};

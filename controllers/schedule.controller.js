const Schedule = require("../models/schedule.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");

/*******************************************************************
 * CREATE A SCHEDULE
 *  ******************************************************************/
const createSchedule = asyncHandler(async (req, res) => {
  try {
    const { location, time, date, movieId } = req.body;

    //REQUIRED FIELDS
    if (!location || !time || !date) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //CHECK IF SCHEDULE ALREADY EXIST
    if (await Schedule.findOne({ movieId }))
      return res.status(400).json({
        success: false,
        message: "Schedule already exists!",
      });

    //CREATE NEW SCHEDULE
    new Schedule({
      location,
      time,
      date,
      movieId,
    }).save();

    //SEND A SUCCESS MESSAGE
    res.status(200).json({
      success: true,
      message: "Schedule added successfully!",
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
    const { disLikes, cast } = req.body;

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

module.exports = {
  createSchedule,
  editSchedule,
  deleteSchedule,
  viewSchedule,
  viewAllSchedule,
};

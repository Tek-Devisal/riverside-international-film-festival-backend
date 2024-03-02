const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { tokenBlacklist } = require("../controllers/user.controller");

/*******************************************************************
 * AUTHENTICATE ALL USERS
 *  ******************************************************************/
const authenticate = asyncHandler(async (req, res, next) => {
  if (req?.headers?.authorization.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        //CHECK IF TOKEN IS BLACKLISTED
        if (tokenBlacklist.has(token)) {
          return res.status(400).json({
            success: false,
            message: "Not authorized",
          });
        }

        //DECODE THE TOKEN
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);

        //SAVE THE USER INSTANCE TO REQ.USER
        req.user = user;
        next();
      }
    } catch (error) {
      res.status(400).json({
        message: "Not authorized token expired, please login again",
      });
    }
  } else {
    return res.status(400).json({
      message: "There is no token attached to header",
    });
  }
});

/*******************************************************************
 * AUTHENTICATE CREATOR
 *  ******************************************************************/
const creator = asyncHandler(async (req, res, next) => {
  const creator = req.user;

  //IF USER IS NOT A CREATOR
  if (creator.role !== "creator") {
    return res.status(400).json({
      success: false,
      message: "You are not a creator!",
    });
  }
  if (creator.role === "creator") {
    next();
  }
});

/*******************************************************************
 * AUTHENTICATE ADMIN
 *  ******************************************************************/
const admin = asyncHandler(async (req, res, next) => {
  const admin = req.user;

  //IF USER IS NOT AN ADMIN
  if (admin.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "You are not an admin!",
    });
  }
  if (admin.role === "admin") {
    next();
  }
});

module.exports = { authenticate, creator, admin };

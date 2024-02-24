const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { tokenBlacklist } = require("../controllers/user.controller");

const authenticate = asyncHandler(async (req, res, next) => {
  if (req?.headers?.authorization.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        //Check if token is already in blacklisted tokens
        if (tokenBlacklist.has(token)) {
          return res.status(400).json({
            success: false,
            message: "Not authorized",
          });
        }

        //Decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);

        //Save the user instance to req.user
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

const creator = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (user.role !== "creator") {
    return res.status(400).json({
      success: false,
      message: "You are not a creator!",
    });
  }
  if (user.role === "creator") {
    next();
  }
});

const admin = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (user.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "You are not an admin!",
    });
  }
  if (user.role === "admin") {
    next();
  }
});

module.exports = { authenticate, creator, admin };

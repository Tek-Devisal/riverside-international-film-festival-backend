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
        const admin = await User.findById(decoded?.id);

        //Save the admin instance to req.admin
        req.admin = admin;
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

const isCreator = asyncHandler(async (req, res, next) => {
  const creatorId = req.user._id;
  if (creatorId.role !== "creator") throw new Error("You are not a creator");
  if (creatorId.role === "creator") {
    next();
  }
});

module.exports = { authenticate, isCreator };

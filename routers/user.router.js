const express = require("express");
const router = express.Router();

const {
  login,
  passwordToken,
  logout,
  refresh,
  updatePassword,
  resetPassword,
  update,
  signup,
  verifyOtp,
  generateOtp,
  deleteUser
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");

//Post routes
router.post("/login", login);
router.post("/signup", signup);
router.post("/password-token", passwordToken);
router.post("/generate-otp", generateOtp);
router.post("/verify-otp", verifyOtp);
router.post("/delete-user", deleteUser);

//Get routes
router.get("/logout", logout);
router.get("/refresh", refresh);

//Put routes
router.put("/update", authenticate, update);
router.put("/update-password", authenticate, updatePassword);
router.put("/reset-password/:token", resetPassword);

//Delete routes

module.exports = router;

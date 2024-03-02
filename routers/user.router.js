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
  createAccount,
  verifyOtp,
  generateOtp,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");

//Post routes
router.post("/login", login);
router.post("/signup", createAccount);
router.post("/password-token", passwordToken);
router.post("/generate-otp", generateOtp);
router.post("/verify-otp", verifyOtp);

//Get routes
router.get("/logout", logout);
router.get("/refresh", refresh);

//Put routes
router.put("/update", authenticate, update);
router.put("/update-password", authenticate, updatePassword);
router.put("/reset-password/:token", resetPassword);

//Delete routes

module.exports = router;

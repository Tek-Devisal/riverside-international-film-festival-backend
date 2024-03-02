const User = require("../models/user.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");
const sendEmail = require("../configs/email.config");
const { generateToken } = require("../configs/token.config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");

//BLACKLIST FOR INVALIDATED TOKENS
const tokenBlacklist = new Set();

//TEMPORARY STORAGE FOR RESET TOKENS
const resetTokens = {};

//TEMPORARY STORAGE FOR OTPS
const OTPs = {};

/*******************************************************************
 * CREATE AN ACCOUNT
 *  ******************************************************************/
const createAccount = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { email, password, username, role } = req.body;

    //CHECK FOR INPUTS IN REQUIRED FIELDS
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //CHECK IF EMAIL ALREADY EXISTS
    if (await User.findOne({ email }))
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    //CREATE A NEW USER
    new User({
      email,
      password,
      username,
      role,
    }).save();

    //SEND A SUCCESS RESPOND
    res.status(200).json({
      success: true,
      message: "Account created successfully!",
    });
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/*******************************************************************
 * LOGIN
 *  ******************************************************************/
const login = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { email, password } = req.body;

    //CHECK FOR INPUTS IN REQUIRED FIELDS
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //CHECK IF EMAIL ALREADY EXISTS
    const user = await User.findOne({ email });

    //SEND A FAILED RESPOND
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    //CHECK IF PASSWORD MATCHES USER'S PASSWORD
    if (user && (await user.isPasswordMatched(password))) {
      const token = generateToken(user._id);

      //CREATE A COOKIE
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000,
        secure: false,
      });

      //SEND A SUCCESS RESPOND
      res.status(200).json({
        success: true,
        message: "User logged in successfully!",
        data: {
          name: user.name,
          email: user.email,
          token: token,
        },
      });
    } else {
      //SEND A FAILED RESPOND
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * CREATE A REFRESH TOKEN
 *  ******************************************************************/
const refresh = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { _id } = req.user;
    const { token } = req.cookies;

    //SEND A FAILED RESPOND
    if (!token)
      res.status(400).json({
        success: false,
        message: "No token in cookies",
      });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || _id != decoded.id) {
        //SEND A FAILED RESPOND
        res.status(400).json({
          success: false,
          message: "There is something wrong with token",
        });
      }

      //SEND A SUCCESS RESPOND
      res.status(200).json({
        success: true,
        data: generateToken(_id),
      });
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * CREATE A PASSWORD RESET TOKEN
 *  ******************************************************************/
const passwordToken = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { email } = req.body;

    //CHECK IF EMAIL ALREADY EXISTS
    const user = await User.findOne({ email });

    //SEND A FAILED RESPOND
    if (!user)
      res.status(400).json({
        success: false,
        message: "User not found with this email address",
      });

    //CREATE A TOKEN
    const token = crypto
      .createHash("sha256")
      .update(crypto.randomBytes(32).toString("hex"))
      .digest("hex");

      //CREATE EXPIRATION DATE
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

    //STORE TOKEN AND EXPIRATION TIME
    resetTokens[email] = { token, expirationTime };

    const activationUrl = `<a href= https://localhost/api/v1/user/reset-password/${token}> Reset Password </a>`;

    //SEND AN EMAIL
    try {
      sendEmail({
        email: user.email,
        subject: "Reset your password",
        message: `Hello ${user.name}, please click on the link to reset your password. This link is valid for 10 minutes from now. ${activationUrl}`,
      });

      //SEND A SUCCESS RESPOND
      res.status(200).json({
        success: true,
        message: `Please check your email:- ${user.email} to reset your password!`,
      });
    } catch (error) {
      res.status(400).json(error.message);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * UPDATE PASSWORD
 *  ******************************************************************/
const updatePassword = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    //VALIDATE MONGODB ID
    mongodbIdValidator(userId);

    //SELECT A USER'S PASSWORD
    const user = await User.findById(userId).select("+password");

    //CHECK IF PASSWORD MATCHES OLD PASSWORD
    const checkPassword = await user.isPasswordMatched(oldPassword);

    //SEND A FAILED RESPOND
    if (!checkPassword)
      res.status(400).send({
        success: false,
        message: "Old password is incorrect!",
      });

    //SET PASSWORD TO CURRENT
    user.password = newPassword;
    await user.save();

    //SEND A SUCCESS RESPOND
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * RESET PASSWORD
 *  ******************************************************************/
const resetPassword = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { token } = req.params;
    const { email, newPassword } = req.body;
    const storedToken = resetTokens[email];

    // CHECK IF TOKEN IS VALID
    if (
      storedToken ||
      storedToken !== token ||
      new Date() > new Date(storedToken.expirationTime)
    ) {
      //SEND A FAILED RESPOND
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    //FIND USER AND UPDATE PASSWORD
    const user = await User.findOneAndUpdate(
      { email },
      { password: newPassword }
    );

    //SEND A FAILED RESPOND
    if (!user)
      res.status(400).json({
        success: false,
        message: "Token expired, please try again later",
      });

    //DELETE STORED TOKEN
    delete storedToken;

    //SEND A SUCCESS RESPOND
    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * UPDATE A USER
 *  ******************************************************************/
const update = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { _id } = req.user;
    const { email, password } = req.body;

    //VALIDATE MONGODB ID
    mongodbIdValidator(_id);

    //FIND USER AND UPDATE
    const update = await User.findByIdAndUpdate(
      _id,
      {
        email,
        password,
      },
      {
        new: true,
      }
    );

    //SEND A FAILED RESPOND
    if (!update) {
      return res.status(400).json({
        success: false,
        message: "User do not exist!",
      });
    }

    //SEND A SUCCESS RESPOND
    res.status(200).json({
      success: true,
      message: "User updated",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * LOGOUT
 *  ******************************************************************/
const logout = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const token = req.cookies.token;

    //SEND A FAILED RESPOND
    if (!token) res.status(400).send("No token in cookies");

    //BLACKLIST TOKEN
    tokenBlacklist.add(token);

    //CLEAR COOKIES
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });

    //SEND A SUCCESS RESPOND
    res.status(200).json({
      success: true,
      message: "Log out successfully",
    });

    //FORBIDDEN
    res.sendStatus(403);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * GENERATE OTP
 *  ******************************************************************/
const generateOtp = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { email } = req.body;

    //FIND USER WITH EMAIL
    const user = await User.findOne({ email });

    //SEND A FAILED RESPOND
    if (!user)
      res.status(400).json({
        success: false,
        message: "User not found with this email address",
      });

    //GENERATE OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    OTPs[email] = { otp };

    //SEND AN EMAIL TO USER
    try {
      sendEmail({
        email: user.email,
        subject: "Reset your password",
        message: `Hello ${user.name}, your OTP is ${otp}`,
      });

      //SEND A SUCCESS RESPOND
      res.status(200).json({
        success: true,
        message: "OTP sent to your email",
      });
    } catch (error) {
      res.status(400).json(error.message);
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/*******************************************************************
 * VERIFY OTP
 *  ******************************************************************/
const verifyOtp = asyncHandler(async (req, res) => {
  try {
    //TAKE INPUTS FROM REQUEST
    const { enteredOtp } = req.body;
    const storedOtp = OTPs[email];

    if (storedOtp === enteredOtp) {
      // CORRECT OTP
      res.status(200).json({
        success: true,
        message: "OTP verification successful",
      });
    } else {
      // INCORRECT OTP
      res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

module.exports = {
  login,
  createAccount,
  passwordToken,
  logout,
  refresh,
  updatePassword,
  resetPassword,
  update,
  tokenBlacklist,
  generateOtp,
  verifyOtp,
};

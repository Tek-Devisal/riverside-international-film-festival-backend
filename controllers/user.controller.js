const User = require("../models/user.model.js");
const asyncHandler = require("express-async-handler");
const mongodbIdValidator = require("../configs/mongoIdValidator.config");
const sendEmail = require("../configs/email.config");
const { generateToken } = require("../configs/token.config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");

// Blacklist for invalidated tokens
const tokenBlacklist = new Set();

//Temporary storage for reset tokens
const resetTokens = {};

//Temporary storage for OTPss
const OTPs = {};

/********************************************************************************************************************************************
 * Create an account
 */
const signup = asyncHandler(async (req, res) => {
  try {
    // Take inputs from the request
    const { email, password, username, role } = req.body;

    // Check for inputs in required fields
    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }
    
    // Check if email already exists
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check if username already exists
    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Create new user
    await new User({
      email,
      password,
      username,
      role,
    }).save();

    // Send a success message
    res.status(200).json({
      success: true,
      message: "Account created successfully!",
      user: {
        _id: '1',
        username: username,
        email: email,
        token: 'pass',
        role: 'user'
      }
    });
  } catch (error) {
    // Check if the error is a duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyValue) {
      // Handle duplicate key error (username or email already exists)
      if (error.keyPattern.username) {
        return res.status(400).json({
          success: false,
          message: "Username already exists",
        });
      } else if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }
    return res.status(400).json({ success: false, message: error.message });
  }
});


/********************************************************************************************************************************************
 * Login
 */
const login = asyncHandler(async (req, res) => {
  try {
    //Take inputs from the request
    const { email, password } = req.body;

    //Check for inputs in required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "A required field was not provided",
      });
    }

    //Check if email already exists
    const user = await User.findOne({
      email,
    });

    //If email does not exist, a fail message is sent
    if (!user)
      return res.status(400).json({
        success: false,
        message: "User not found",
      });

    //Check if password corresponds to the current user
    if (user && (await user.isPasswordMatched(password))) {
      const token = generateToken(user._id);

      //Create a cokie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000,
        secure: false,
      });

      res.status(200).json({
        success: true,
        message: "User logged in successfully!",
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          token: token,
          role: user.role
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************************************************************************************
 *Create a refresh token
 */
const refresh = asyncHandler(async (req, res) => {
  try {
    //Take inputs from the request
    const { _id } = req.user;
    const { token } = req.cookies;

    if (!token)
      res.status(400).json({
        success: false,
        message: "No token in cookies",
      });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || _id != decoded.id) {
        res.status(400).json({
          success: false,
          message: "There is something wrong with token",
        });
      }

      res.status(200).json({
        success: true,
        data: generateToken(_id),
      });
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************************************************************************************
 * Create a password reset token
 */
const passwordToken = asyncHandler(async (req, res) => {
  try {
    //Take inputs from the request
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      res.status(400).json({
        success: false,
        message: "User not found with this email address",
      });

    const token = crypto
      .createHash("sha256")
      .update(crypto.randomBytes(32).toString("hex"))
      .digest("hex");
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);

    resetTokens[email] = { token, expirationTime };

    const activationUrl = `<a href= https://localhost/api/v1/user/reset-password/${token}> Reset Password </a>`;

    try {
      sendEmail({
        email: user.email,
        subject: "Reset your password",
        message: `Hello ${user.name}, please click on the link to reset your password. This link is valid for 10 minutes from now. ${activationUrl}`,
      });

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

/********************************************************************************************************************************************
 * Update password
 */
const updatePassword = asyncHandler(async (req, res) => {
  try {
    //Take inputs from the request
    const { _id } = req.user;
    const { oldPassword, newPassword } = req.body;

    //Validate mongodb ID
    mongodbIdValidator(_id);

    const user = await User.findById(_id).select("+password");

    const checkPassword = await user.isPasswordMatched(oldPassword);

    if (!checkPassword)
      res.status(400).send({
        success: false,
        message: "Old password is incorrect!",
      });

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************************************************************************************
 * Reset password
 */
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    const { email, newPassword } = req.body;
    const storedToken = resetTokens[email];

    const user = await User.findOneAndUpdate(
      { email },
      { password: newPassword }
    );

    if (!user)
      res.status(400).json({
        success: false,
        message: "Token expired, please try again later",
      });

    // Check if the token is valid
    if (
      storedToken ||
      storedToken !== token ||
      new Date() > new Date(storedToken.expirationTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    delete storedToken;

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************************************************************************************
 * Update an user
 */
const update = asyncHandler(async (req, res) => {
  try {
    //Take inputs from the request
    const { _id } = req.user;
    const { email, password } = req.body;

    //Validate mongodb ID
    mongodbIdValidator(_id);

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

    if (!update) {
      return res.status(400).json({
        success: false,
        message: "User do not exist!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated",
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************************************************************************************
 *Logout
 */
const logout = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) res.status(400).send("No token in cookies");

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "Log out successfully",
    });

    res.sendStatus(403); //FORBIDDEN
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/********************************************************************************************************************************************
 * GENERATE OTP
 */
const generateOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      res.status(400).json({
        success: false,
        message: "User not found with this email address",
      });

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    OTPs[email] = { otp };

    try {
      sendEmail({
        email: user.email,
        subject: "Reset your password",
        message: `Hello ${user.name}, your OTP is ${otp}`,
      });

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
/********************************************************************************************************************************************
 * VERIFY OTP
 */
const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const storedOtp = OTPs[email];
    const { enteredOtp } = req.body;
    
    if (storedOtp === enteredOtp) {
      // OTP is correct
      res.status(200).json({
        success: true,
        message: "OTP verification successful",
      });
    } else {
      // OTP is incorrect
      res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
  }
});
/********************************************************************************************************************************************
 * DELETE ACCOUNT
 */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    // Take inputs from the request
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to delete the account",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete the user
    await user.deleteOne();

    // Send a success message
    res.status(200).json({
      success: true,
      message: "Account deleted successfully!",
      user: {
        _id: "1",
        email: '',
        username: '',
        token: '',
        role: ''
      },
    });
  } catch (error) {
    // Handle errors
    return res.status(400).json({ success: false, message: error.message });
  }
});



module.exports = {
  login,
  signup,
  passwordToken,
  logout,
  refresh,
  updatePassword,
  resetPassword,
  update,
  tokenBlacklist,
  generateOtp,
  verifyOtp,
  deleteUser
};

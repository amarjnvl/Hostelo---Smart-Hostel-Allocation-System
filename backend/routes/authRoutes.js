const express = require("express");
const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  registerStudent,
  loginStudent,
} = require("../controllers/authController");

// Register a new student
router.post("/register", registerStudent);

// Login student (with rollNo + college)
router.post("/login", loginStudent);

// OTP routes (used for passwordless/OTP-based login)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;


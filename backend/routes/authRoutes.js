const express = require("express");
const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  registerStudent,
  loginStudent,
} = require("../controllers/authController");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;

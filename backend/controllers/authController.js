const Student = require("../models/Student");
const OTP = require("../models/OTP");
const sendOtp = require("../utils/sendOtp");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { rollNo } = req.body;
    const student = await Student.findOne({ rollNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.create({ email: student.email, otp });
    student.otp = otp;
    student.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await student.save();

    await sendOtp(student.email, otp);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Internal error" });
  }
};

// Verify OTP & login
exports.verifyOtp = async (req, res) => {
  try {
    const { rollNo, otp } = req.body;
    const student = await Student.findOne({ rollNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const validOtp = await OTP.findOne({ email: student.email, otp });
    const isOtpExpired = student.otpExpires && student.otpExpires < new Date();

    if (!validOtp || isOtpExpired) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    student.otp = null;
    student.otpExpires = null;
    await student.save();
    await OTP.deleteOne({ _id: validOtp._id });

    const token = jwt.sign(
      { id: student._id, rollNo: student.rollNo },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );

    res.status(200).json({ message: "Login successful", token, student });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal error" });
  }
};

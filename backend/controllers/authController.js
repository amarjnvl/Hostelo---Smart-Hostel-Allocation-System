const Student = require("../models/Student");
const OTP = require("../models/OTP");
const sendOtp = require("../utils/sendOtp");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const College = require("../models/College");
const { signInToken } = require("../utils/jwt");

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

    console.log(`Generated OTP for ${student.email}: ${otp}`);

    await sendOtp(student.email, otp);
    res
      .status(200)
      .json({ message: `OTP sent to email is ${otp} please verify to login` });
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

exports.registerStudent = async (req, res) => {
  try {
    const { name, rollNo, gender, college } = req.body;

    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Roll number already registered" });
    }

    const collegeId = await College.findById(college);
    if (!collegeId) {
      return res.status(400).json({ message: "College not found" });
    }

    const student = await Student.create({
      name,
      rollNo,
      gender,
      college: collegeId._id,
    });
    // Ensure the pre-save hook has populated the email field
    if (!student.email) {
      return res.status(400).json({ message: "Failed to generate email" });
    } else {
      console.log("Generated email:", student.email);
    }

    const token = signInToken({ id: student._id });

    res.status(201).json({
      message: "Student registered successfully",
      token,
      student,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { rollNo, college } = req.body;

    const collegeId = await College.findById(college);
    if (!collegeId) {
      return res.status(400).json({ message: "College not found" });
    }

    const student = await Student.findOne({ rollNo, college: collegeId._id });
    if (!student) {
      return res
        .status(400)
        .json({ message: "Invalid roll number or college" });
    }

    const token = signInToken({ id: student._id });
    res.status(200).json({
      message: "Login successful",
      token,
      student,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

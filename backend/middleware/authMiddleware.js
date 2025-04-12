const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // console.log("Token:", token);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get student with college info
    const student = await Student.findById(decoded.id)
      .populate("college")
      .select("-otp -otpExpires");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Add user info to request
    req.user = {
      id: student._id,
      rollNo: student.rollNo,
      college: student.college._id,
      gender: student.gender,
      role: student.role,
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      error: err.message,
    });
  }
};

const adminProtect = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no user found",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized as an admin",
        currentRole: req.user.role,
      });
    }

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
      error: err.message,
    });
  }
};

module.exports = { protect, adminProtect };

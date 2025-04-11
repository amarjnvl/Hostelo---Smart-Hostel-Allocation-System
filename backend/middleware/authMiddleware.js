const jwt = require("jsonwebtoken");
const Student = require("../models/Student");


const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const student = await Student.findById(decoded.id).populate("college");
      if (!student)
        return res.status(404).json({ message: "Student not found" });

      req.user = {
        id: student._id,
        rollNo: student.rollNo,
        college: student.college._id,
        gender: student.gender,
      };

      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };

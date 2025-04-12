const Student = require("../models/Student");

// Get all students (for admin)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("college");
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a specific student by roll number (only for the student)
exports.getStudentByRollNo = async (req, res) => {
  try {
    if (req.user.rollNo !== req.params.rollNo) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const student = await Student.findOne({
      rollNo: req.params.rollNo,
    }).populate("allocation");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Update student details
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

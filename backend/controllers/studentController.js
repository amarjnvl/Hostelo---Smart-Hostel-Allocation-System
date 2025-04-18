const Student = require("../models/Student"); // Changed from studentModel to Student
const jwt = require("jsonwebtoken");
const Hostel = require("../models/Hostel");

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

    const student = await Student.findOne({ rollNo: req.params.rollNo })
      .populate("college")
      .populate({
        path: "preferredHostel",
        populate: { path: "college" },
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (err) {
    console.error("[getStudentByRollNo] Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
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

exports.registerForHostel = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { preferredHostel } = req.body;

    // Find and validate student
    const student = await Student.findById(studentId).populate("college");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if already registered
    if (student.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "Student is already registered for hostel",
      });
    }

    // Validate hostel exists and belongs to student's college
    const hostel = await Hostel.findById(preferredHostel).populate("college");

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // Validate hostel belongs to student's college
    if (!hostel.college._id.equals(student.college._id)) {
      return res.status(400).json({
        success: false,
        message: "Selected hostel does not belong to your college",
      });
    }

    // Validate gender compatibility
    if (hostel.gender !== student.gender) {
      return res.status(400).json({
        success: false,
        message: "Selected hostel is not compatible with student gender",
      });
    }

    // Update student
    student.isRegistered = true;
    student.preferredHostel = preferredHostel;
    student.registrationDate = new Date();

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Successfully registered for hostel",
      data: {
        student: {
          name: student.name,
          rollNo: student.rollNo,
          isRegistered: student.isRegistered,
          isAllocated: student.isAllocated,
          preferredHostel: hostel.name,
          registrationDate: student.registrationDate,
        },
      },
    });
  } catch (error) {
    console.error("[registerForHostel] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register for hostel",
      error: error.message,
    });
  }
};

// Add the new controller function
exports.getStudentGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const student = await Student.findById(req.user.id);

    if (!student || !student.groupId || student.groupId !== groupId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this group",
      });
    }

    // Get all students in group and populate hostel details
    const groupMembers = await Student.find({ groupId })
      .select("name rollNo email isLeader groupHostelChoice")
      .populate("groupHostelChoice", "name") // Populate hostel details
      .sort({ isLeader: -1 });

    if (!groupMembers.length) {
      return res.status(404).json({
        success: false,
        message: "No group members found",
      });
    }

    res.status(200).json({
      success: true,
      data: groupMembers,
    });
  } catch (error) {
    console.error("Get Student Group Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch group members",
    });
  }
};

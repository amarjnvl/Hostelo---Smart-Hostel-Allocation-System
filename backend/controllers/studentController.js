const Student = require("../models/Student");
const Group = require("../models/Group");
const Hostel = require("../models/Hostel");

// Get all students (admin only)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).select("-password");
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student by roll number
const getStudentByRollNo = async (req, res) => {
  try {
    const student = await Student.findOne({ rollNo: req.params.rollNo }).select(
      "-password"
    );
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student profile
const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.studentId,
      { $set: req.body },
      { new: true }
    ).select("-password");

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Set roommate preference
const setRoommatePreference = async (req, res) => {
  try {
    const { desiredCount } = req.body;
    const studentId = req.student.id;

    // Validate the desired count
    if (desiredCount < 0 || desiredCount > 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid roommate count. Must be between 0 and 2.",
      });
    }

    // Update student's roommate preference
    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        roommatePreference: {
          desiredCount: desiredCount,
          savedAt: Date.now(),
        },
      },
      { new: true }
    );

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      message: "Roommate preference saved successfully",
      data: { roommatePreference: student.roommatePreference },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register for hostel allocation
const registerForHostel = async (req, res) => {
  try {
    const { hostelId } = req.body;
    const studentId = req.student.id;

    // Validate hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res
        .status(404)
        .json({ success: false, message: "Hostel not found" });
    }

    // Update student's hostel choice
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Check if student is already in a group
    if (student.groupId) {
      // Update the group's hostel choice
      await Group.findByIdAndUpdate(student.groupId, {
        hostelChoice: hostelId,
      });

      // Update all group members with the same hostel choice
      await Student.updateMany(
        { groupId: student.groupId },
        { $set: { groupHostelChoice: hostelId } }
      );
    } else {
      // If student has preference for roommates but no group
      if (student.roommatePreference?.desiredCount > 0) {
        // Create a new group with this student as leader
        const newGroup = new Group({
          members: [studentId],
          leader: studentId,
          hostelChoice: hostelId,
          capacity: student.roommatePreference.desiredCount + 1, // Count includes the student
        });
        await newGroup.save();

        // Update student record
        student.groupId = newGroup._id;
        student.isLeader = true;
        student.groupHostelChoice = hostelId;
      } else {
        // Student wants a solo room
        student.groupHostelChoice = hostelId;
      }
    }

    // Mark as registered for hostel
    student.isRegistered = true;
    await student.save();

    res.json({
      success: true,
      message: "Successfully registered for hostel allocation",
      data: { student },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student group details
const getStudentGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Find students in this group
    const students = await Student.find({ groupId }).select("-password");

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found in this group",
      });
    }

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove member from group
const removeFromGroup = async (req, res) => {
  try {
    const { rollNo } = req.body;
    const requestingStudent = await Student.findById(req.student.id);

    // Check if requesting student is a group leader
    if (!requestingStudent.isLeader) {
      return res.status(403).json({
        success: false,
        message: "Only group leaders can remove members",
      });
    }

    // Find the student to remove
    const studentToRemove = await Student.findOne({ rollNo });
    if (!studentToRemove) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if both students are in the same group
    if (
      studentToRemove.groupId.toString() !==
      requestingStudent.groupId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This student is not in your group",
      });
    }

    // Cannot remove self if leader (should use leave-group instead)
    if (studentToRemove._id.toString() === requestingStudent._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Group leaders cannot remove themselves",
      });
    }

    // Remove student from group
    studentToRemove.groupId = null;
    studentToRemove.groupHostelChoice = null;
    await studentToRemove.save();

    // Update group members
    await Group.findByIdAndUpdate(requestingStudent.groupId, {
      $pull: { members: studentToRemove._id },
    });

    res.json({
      success: true,
      message: "Member removed from group",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave group (for non-leaders)
const leaveGroup = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);

    if (!student.groupId) {
      return res.status(400).json({
        success: false,
        message: "You are not part of any group",
      });
    }

    // If leader is trying to leave
    if (student.isLeader) {
      // Get all group members
      const groupMembers = await Student.find({ groupId: student.groupId });

      // If leader is the only member, delete the group
      if (groupMembers.length === 1) {
        await Group.findByIdAndDelete(student.groupId);
      } else {
        // Assign another member as leader
        const newLeader = groupMembers.find(
          (member) => member._id.toString() !== student._id.toString()
        );

        await Group.findByIdAndUpdate(student.groupId, {
          leader: newLeader._id,
          $pull: { members: student._id },
        });

        // Update new leader status
        await Student.findByIdAndUpdate(newLeader._id, {
          isLeader: true,
        });
      }
    } else {
      // Non-leader leaving
      await Group.findByIdAndUpdate(student.groupId, {
        $pull: { members: student._id },
      });
    }

    // Update student
    student.groupId = null;
    student.groupHostelChoice = null;
    student.isLeader = false;
    await student.save();

    res.json({
      success: true,
      message: "Successfully left the group",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentByRollNo,
  updateStudent,
  setRoommatePreference,
  registerForHostel,
  getStudentGroup,
  removeFromGroup,
  leaveGroup,
};

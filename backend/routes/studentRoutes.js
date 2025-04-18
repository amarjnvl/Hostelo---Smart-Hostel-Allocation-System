const express = require("express");
const router = express.Router();
const { protect, adminProtect } = require("../middleware/authMiddleware");
const {
  getAllStudents,
  getStudentByRollNo,
  updateStudent,
  registerForHostel,
  getStudentGroup,
  setRoommatePreference,
  removeFromGroup,
  leaveGroup,
} = require("../controllers/studentController");

// Protected routes
router.use(protect);

// Admin routes
router.get("/", adminProtect, getAllStudents);

// Student routes
router.get("/profile/:rollNo", getStudentByRollNo);
router.put("/:studentId", updateStudent);

// Hostel registration routes
router.post("/register", registerForHostel);
router.post("/roommate-preference", setRoommatePreference);
router.get("/group/:groupId", getStudentGroup);

// Group management routes
router.post("/remove-from-group", removeFromGroup);
router.post("/leave-group", leaveGroup);

module.exports = router;
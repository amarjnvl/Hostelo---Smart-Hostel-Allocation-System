const express = require("express");
const router = express.Router();
const { protect, adminProtect } = require("../middleware/authMiddleware");
const {
  getAllStudents,
  getStudentByRollNo,
  updateStudent,
} = require("../controllers/studentController");

// Protected routes
router.use(protect);

// Admin routes
router.get("/", adminProtect, getAllStudents);

// Student routes
router.get("/profile/:rollNo", protect, getStudentByRollNo);
router.put("/:studentId", protect, updateStudent);

module.exports = router;

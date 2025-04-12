const express = require("express");
const router = express.Router();
const { getAllStudents, getStudentByRollNo, updateStudent } = require("../controllers/studentController");
const { protect, adminProtect } = require("../middleware/authMiddleware");

// Route to get all students (admin only)
router.get("/students", adminProtect, getAllStudents);

// Route to get student by roll number (student-specific)
router.get("/student/:rollNo", protect, getStudentByRollNo);

// Route to update student details
router.put("/student/:studentId", protect, updateStudent);

module.exports = router;

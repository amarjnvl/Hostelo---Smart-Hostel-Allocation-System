const express = require("express");
const router = express.Router();
const {
  getHostelsByCollege,
  getHostelById,
  createHostel,
  updateHostel,
} = require("../controllers/hostelController");
const { protect, adminProtect } = require("../middleware/authMiddleware");

// Protected for all logged-in students
router.get("/college/:collegeId", protect, getHostelsByCollege);
router.get("/:hostelId", protect, getHostelById);

// Admin-only routes (IMPORTANT: Protect -> AdminProtect)
router.post("/", protect, adminProtect, createHostel);
router.put("/:hostelId", protect, adminProtect, updateHostel);

module.exports = router;

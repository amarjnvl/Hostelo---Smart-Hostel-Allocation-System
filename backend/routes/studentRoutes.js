// routes/studentRoutes.js
const express = require("express");
const router = express.Router();

const { getMe } = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMe);
router.get("/", (req, res) => {
  res.send("Student route placeholder");
});

module.exports = router;

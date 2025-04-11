const express = require("express");
const router = express.Router();
const {
  sendRoommateRequest,
  verifyRoommateOtp,
} = require("../controllers/roommateController");
const { protect } = require("../middleware/authMiddleware");

router.post("/send-request", protect, sendRoommateRequest);
router.post("/verify-request", protect, verifyRoommateOtp);

module.exports = router;


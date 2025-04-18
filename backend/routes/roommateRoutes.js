const express = require("express");
const router = express.Router();
const {
  sendRoommateRequest,
  verifyRoommateOtp,
  deleteRoommateRequest,
  initiateGroupIntent,
} = require("../controllers/roommateController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Fix: Change the endpoint to match the frontend call
router.post("/send-otp", sendRoommateRequest);
router.post("/verify-otp", verifyRoommateOtp);
router.post("/initiate-group", initiateGroupIntent);
router.delete("/delete/:id", deleteRoommateRequest);

module.exports = router;

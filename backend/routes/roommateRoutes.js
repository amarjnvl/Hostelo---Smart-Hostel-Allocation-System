const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  sendRoommateRequest,
  verifyRoommateOtp,
  deleteRoommateRequest,
} = require("../controllers/roommateController");

router.use(protect);
router.post("/request", sendRoommateRequest);
router.post("/verify", verifyRoommateOtp);

router.delete("delete/:id", deleteRoommateRequest);

module.exports = router;
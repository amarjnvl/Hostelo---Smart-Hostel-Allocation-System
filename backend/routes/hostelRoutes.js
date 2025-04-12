const express = require("express");
const router = express.Router();
const hostelController = require("../controllers/hostelController");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/:collegeId", authMiddleware.protect, hostelController.getHostelsByCollege);
router.get("/:collegeId/:hostelId", authMiddleware.protect, hostelController.getHostelById);
router.post("/", authMiddleware.adminProtect, hostelController.createHostel);
router.put("/:hostelId", authMiddleware.adminProtect, hostelController.updateHostel);

module.exports = router;


const express = require("express");
const router = express.Router();
const { protect, adminProtect } = require("../middleware/authMiddleware");
const { allocateRoomsToGroup } = require("../controllers/allocationController");

router.use(protect);
router.use(adminProtect);

router.post("/allocate/:collegeId", allocateRoomsToGroup);

module.exports = router;

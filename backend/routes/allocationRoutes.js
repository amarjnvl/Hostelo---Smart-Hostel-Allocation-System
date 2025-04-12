const express = require("express");
const router = express.Router();
const { allocateRoomsToGroup } = require("../controllers/allocationController");

// Allocate all rooms in college (call this once at the end)
router.post("/allocate-rooms", async (req, res) => {
  try {
    const { collegeId } = req.body;
    const result = await allocateRoomsToGroup(collegeId);
    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;

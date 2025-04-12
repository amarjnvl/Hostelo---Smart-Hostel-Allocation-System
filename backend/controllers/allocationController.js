const {
  allocateRoomForStudent,
  allocateRoomForGroup,
} = require("../utils/roomAllocator");
const buildMutualGroups = require("../utils/groupGraph");
const Student = require("../models/Student");

exports.allocateRoomsToGroup = async (req, res) => {
  console.log("Starting room allocation process...");
  try {
    const { collegeId } = req.body;
    console.log("College ID received:", collegeId);

    if (!collegeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID format",
      });
    }

    // 1. Get all unallocated students
    const unallocatedStudents = await Student.find({
      college: collegeId,
      isAllocated: false,
    });

    if (!unallocatedStudents.length) {
      return res.status(200).json({
        success: true,
        message: "No unallocated students found",
      });
    }

    // 2. Build mutual groups from roommate requests
    const mutualGroups = await buildMutualGroups(collegeId);
    const groupedIds = new Set(
      mutualGroups.flat().map((s) => s._id.toString())
    );

    // 🔥 IMPORTANT: Also add all students with a groupId in DB (not just mutual graph-built)
    const dbGroupedStudents = await Student.find({
      college: collegeId,
      isAllocated: false,
      groupId: { $ne: null },
    });
    dbGroupedStudents.forEach((s) => groupedIds.add(s._id.toString()));

    // 3. Filter out students in groups from solo allocation
    const ungroupedStudents = unallocatedStudents.filter(
      (s) => !groupedIds.has(s._id.toString())
    );

    // 4. Build allocation queue (group first, then solo)
    const allocationQueue = [];

    for (let group of mutualGroups) {
      const timestamp = Math.max(
        ...group.map((s) => new Date(s.updatedAt || s.createdAt).getTime())
      );
      allocationQueue.push({ type: "group", data: group, timestamp });
    }

    for (let student of ungroupedStudents) {
      const timestamp = new Date(
        student.updatedAt || student.createdAt
      ).getTime();
      allocationQueue.push({ type: "single", data: student, timestamp });
    }

    allocationQueue.sort((a, b) => a.timestamp - b.timestamp);

    // 5. Allocation loop
    const results = {
      success: [],
      failures: [],
    };

    for (let item of allocationQueue) {
      try {
        if (item.type === "group") {
          if (!item.data.some((s) => s.isAllocated)) {
            const allocation = await allocateRoomForGroup(item.data);
            results.success.push({
              type: "group",
              size: item.data.length,
              allocation,
            });
          } else {
            console.log("Skipping group - some students already allocated");
          }
        } else {
          if (!item.data.isAllocated) {
            const allocation = await allocateRoomForStudent(item.data);
            results.success.push({
              type: "single",
              student: item.data.rollNo,
              allocation,
            });
          } else {
            console.log(
              `Skipping student ${item.data.rollNo} - already allocated`
            );
          }
        }
      } catch (err) {
        results.failures.push({
          type: item.type,
          data:
            item.type === "group"
              ? item.data.map((s) => s.rollNo)
              : item.data.rollNo,
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Room allocation completed",
      results: {
        totalProcessed: allocationQueue.length,
        successful: results.success.length,
        failed: results.failures.length,
        details: results,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Room allocation failed",
      error: err.message,
    });
  }
};

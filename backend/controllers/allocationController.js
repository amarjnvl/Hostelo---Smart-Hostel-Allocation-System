const {
  allocateRoomForStudent,
  allocateRoomForGroup,
} = require("../utils/roomAllocator");
const { buildMutualGroups } = require("../utils/groupGraph");
const Student = require("../models/Student");
const College = require("../models/College");

exports.allocateRooms = async (req, res) => {
  console.log("[allocateRooms] Starting room allocation process...");
  try {
    const { collegeId } = req.params;
    console.log("[allocateRooms] College ID received:", collegeId);

    const college = await College.findById(collegeId);
    if (!college) {
      console.log("[allocateRooms] College not found:", collegeId);
      return res.status(400).json({
        success: false,
        message: "College not found",
      });
    }
    console.log("[allocateRooms] Found college:", college.name);

    // 1. Get all unallocated students
    console.log("[allocateRooms] Fetching unallocated students...");
    const unallocatedStudents = await Student.find({
      college: collegeId,
      isAllocated: false,
      role: "student",
      isRegistered: true,
    });
    console.log(
      `[allocateRooms] Found ${unallocatedStudents.length} unallocated students`
    );

    if (!unallocatedStudents.length) {
      console.log("[allocateRooms] No unallocated students found");
      return res.status(200).json({
        success: true,
        message: "No unallocated students found",
      });
    }

    // 2. Build mutual groups
    console.log("[allocateRooms] Building mutual groups...");
    const mutualGroups = await buildMutualGroups(collegeId);
    console.log(`[allocateRooms] Built ${mutualGroups.length} mutual groups`);

    const groupedIds = new Set(
      mutualGroups.flat().map((s) => s._id.toString())
    );
    console.log(
      `[allocateRooms] Found ${groupedIds.size} students in mutual groups`
    );

    // Get DB grouped students
    console.log("[allocateRooms] Fetching DB grouped students...");
    const dbGroupedStudents = await Student.find({
      college: collegeId,
      isAllocated: false,
      groupId: { $ne: null },
    });
    console.log(
      `[allocateRooms] Found ${dbGroupedStudents.length} DB grouped students`
    );
    dbGroupedStudents.forEach((s) => groupedIds.add(s._id.toString()));

    // 3. Filter ungrouped students
    console.log("[allocateRooms] Filtering ungrouped students...");
    const ungroupedStudents = unallocatedStudents.filter(
      (s) => !groupedIds.has(s._id.toString())
    );
    console.log(
      `[allocateRooms] Found ${ungroupedStudents.length} ungrouped students`
    );

    // 4. Build allocation queue
    console.log("[allocateRooms] Building allocation queue...");
    const allocationQueue = [];

    for (let group of mutualGroups) {
      const freshGroup = await Student.find({
        _id: { $in: group.map((s) => s._id) },
      });
      const timestamp = Math.max(
        ...freshGroup.map((s) => new Date(s.updatedAt || s.createdAt).getTime())
      );
      console.log(
        `[allocateRooms] Adding group of ${freshGroup.length} students to queue`
      );
      allocationQueue.push({ type: "group", data: freshGroup, timestamp });
    }

    for (let student of ungroupedStudents) {
      const timestamp = new Date(
        student.updatedAt || student.createdAt
      ).getTime();
      console.log(`[allocateRooms] Adding student ${student.rollNo} to queue`);
      allocationQueue.push({ type: "single", data: student, timestamp });
    }

    allocationQueue.sort((a, b) => a.timestamp - b.timestamp);
    console.log(`[allocateRooms] Total queue size: ${allocationQueue.length}`);

    // 5. Allocation loop
    console.log("[allocateRooms] Starting allocation process...");
    const results = {
      success: [],
      failures: [],
      skipped: [],
    };

    for (let item of allocationQueue) {
      try {
        if (item.type === "group") {
          if (!item.data.some((s) => s.isAllocated)) {
            console.log(
              `[allocateRooms] Allocating room for group of ${item.data.length} students`
            );
            const allocation = await allocateRoomForGroup(item.data);
            results.success.push({
              type: "group",
              size: item.data.length,
              students: item.data.map((student) => ({
                name: student.name,
                rollNo: student.rollNo,
              })),
              roomNumber: allocation.room.roomNumber,
              hostelName: allocation.room.hostel.name,
            });
            console.log("[allocateRooms] Group allocation successful");
          } else {
            console.log(
              "[allocateRooms] Skipping group - some students already allocated"
            );
          }
        } else {
          try {
            // Handle single student allocation
            if (!item.data.isAllocated) {
              console.log(
                `[allocateRooms] Processing single allocation for student ${item.data.rollNo}`
              );

              // Validate student registration
              if (!item.data.isRegistered) {
                throw new Error("Student is not registered for allocation");
              }

              // Attempt allocation
              const allocation = await allocateRoomForStudent(item.data);

              if (!allocation) {
                throw new Error("Room allocation failed");
              }

              // Add successful allocation to results
              results.success.push({
                type: "single",
                student: {
                  name: item.data.name,
                  rollNo: item.data.rollNo,
                },
                roomNumber: allocation.room.number,
                hostelName: allocation.room.hostel.name,
                allocatedAt: new Date(),
              });

              console.log(
                `[allocateRooms] Successfully allocated room ${allocation.room.number} in ${allocation.room.hostel.name}`
              );
            } else {
              console.log(
                `[allocateRooms] Skipping student ${item.data.rollNo} - already allocated`
              );
              results.skipped.push({
                type: "single",
                student: {
                  name: item.data.name,
                  rollNo: item.data.rollNo,
                },
                reason: "Already allocated",
              });
            }
          } catch (error) {
            console.error(
              `[allocateRooms] Failed to allocate room for student ${item.data.rollNo}:`,
              error
            );
            results.failures.push({
              type: "single",
              student: {
                name: item.data.name,
                rollNo: item.data.rollNo,
              },
              error: error.message,
            });
          }
        }
      } catch (err) {
        console.error(`[allocateRooms] Allocation failed:`, err);
        results.failures.push({
          type: item.type,
          students:
            item.type === "group"
              ? item.data.map((student) => ({
                  name: student.name,
                  rollNo: student.rollNo,
                }))
              : {
                  name: item.data.name,
                  rollNo: item.data.rollNo,
                },
          error: err.message,
        });
      }
    }

    console.log("[allocateRooms] Allocation process completed");
    console.log(
      `[allocateRooms] Success: ${results.success.length}, Failures: ${results.failures.length}`
    );

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
    console.error("[allocateRooms] Fatal error:", err);
    return res.status(500).json({
      success: false,
      message: "Room allocation failed",
      error: err.message,
    });
  }
};

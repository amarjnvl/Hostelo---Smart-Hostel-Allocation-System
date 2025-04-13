const RoommateRequest = require("../models/RoommateRequest");
const Student = require("../models/Student");
const Hostel = require("../models/Hostel");
const DisjointSet = require("./disjointSet");

const buildMutualGroups = async (collegeId) => {
  console.log("[buildMutualGroups] Starting with collegeId:", collegeId);

  if (!collegeId) {
    console.error("[buildMutualGroups] Missing collegeId");
    throw new Error("College ID is required");
  }

  try {
    // Get accepted requests
    console.log("[buildMutualGroups] Fetching accepted requests...");
    const acceptedRequests = await RoommateRequest.find({
      college: collegeId,
      status: "accepted",
    }).lean();
    console.log(
      `[buildMutualGroups] Found ${acceptedRequests.length} accepted requests`
    );

    // Get max capacity from any hostel in this college
    // console.log("[buildMutualGroups] Fetching max hostel capacity...");
    // const maxHostel = await Hostel.findOne({ college: collegeId })
    //   .sort({ roomCapacity: -1 })
    //   .lean();
    // const maxCapacity = maxHostel?.roomCapacity ?? 3;
    // console.log(`[buildMutualGroups] Max room capacity: ${maxCapacity}`);

    // If no accepted requests, return empty array
    if (!acceptedRequests.length) {
      console.log(
        "[buildMutualGroups] No accepted requests found, returning empty array"
      );
      return [];
    }

    // Unique student IDs
    console.log("[buildMutualGroups] Building unique student IDs set...");
    const allStudentIds = new Set();
    acceptedRequests.forEach((req) => {
      allStudentIds.add(req.from.toString());
      allStudentIds.add(req.to.toString());
    });
    console.log(
      `[buildMutualGroups] Total unique students: ${allStudentIds.size}`
    );

    const idList = Array.from(allStudentIds);
    const idToIndex = new Map(idList.map((id, idx) => [id, idx]));
    console.log("[buildMutualGroups] Created ID to index mapping");

    console.log("[buildMutualGroups] Initializing DisjointSet...");
    const dsu = new DisjointSet(idList.length);

    // Union all accepted pairs
    console.log("[buildMutualGroups] Processing accepted pairs...");
    acceptedRequests.forEach((req, index) => {
      const u = idToIndex.get(req.from.toString());
      const v = idToIndex.get(req.to.toString());
      console.log(
        `[buildMutualGroups] Union pair ${index + 1}: ${req.from} (${u}) - ${
          req.to
        } (${v})`
      );
      dsu.unionBySize(u, v);
    });

    // Group students by leader index
    console.log("[buildMutualGroups] Grouping students by leader...");
    const groups = new Map();
    idList.forEach((id, idx) => {
      const leader = dsu.findUpar(idx);
      if (!groups.has(leader)) {
        groups.set(leader, []);
      }
      groups.get(leader).push(id);
    });
    console.log(`[buildMutualGroups] Found ${groups.size} initial groups`);

    // Filter and fetch student documents
    console.log("[buildMutualGroups] Filtering valid groups...");
    const validGroups = Array.from(groups.values()).filter((group) => {
      const isValid = group.length > 1 ? true : false;
      console.log(
        `[buildMutualGroups] Group size ${group.length}: ${
          isValid ? "valid" : "invalid"
        }`
      );
      return isValid;
    });
    console.log(
      `[buildMutualGroups] Valid groups count: ${validGroups.length}`
    );

    console.log("[buildMutualGroups] Fetching student details...");
    const studentGroups = await Promise.all(
      validGroups.map(async (group, index) => {
        const students = await Student.find({ _id: { $in: group } }).lean();
        console.log(
          `[buildMutualGroups] Fetched details for group ${index + 1}: ${
            students.length
          } students`
        );
        return students;
      })
    );

    console.log(
      `[buildMutualGroups] Successfully built ${studentGroups.length} final groups`
    );
    return studentGroups;
  } catch (error) {
    console.error("[buildMutualGroups] Error:", error);
    console.error("[buildMutualGroups] Stack:", error.stack);
    throw new Error("Failed to build mutual groups");
  }
};

module.exports = { buildMutualGroups };

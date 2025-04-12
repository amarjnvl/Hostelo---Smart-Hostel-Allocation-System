const RoommateRequest = require("../models/RoommateRequest");
const Student = require("../models/Student");
const Hostel = require("../models/Hostel");
const DisjointSet = require("./disjointSet");

const buildMutualGroups = async (collegeId) => {
  const acceptedRequests = await RoommateRequest.find({
    college: collegeId,
    status: "accepted",
  });

  // Get max capacity from any hostel in this college
  const maxHostel = await Hostel.findOne({ college: collegeId }).sort({
    roomCapacity: -1,
  });
  const maxCapacity = maxHostel ? maxHostel.roomCapacity : 3;

  // Unique student IDs
  const allStudentIds = new Set();
  acceptedRequests.forEach((req) => {
    allStudentIds.add(req.from.toString());
    allStudentIds.add(req.to.toString());
  });

  const idList = Array.from(allStudentIds);
  const idToIndex = {};
  idList.forEach((id, idx) => (idToIndex[id] = idx));

  const dsu = new DisjointSet(idList.length);

  // Union all accepted pairs
  acceptedRequests.forEach((req) => {
    const u = idToIndex[req.from.toString()];
    const v = idToIndex[req.to.toString()];
    dsu.unionBySize(u, v);
  });

  // Group students by leader index
  const groups = {};
  idList.forEach((id, idx) => {
    const leader = dsu.findUpar(idx);
    if (!groups[leader]) groups[leader] = [];
    groups[leader].push(id);
  });

  // Filter and fetch student documents
  const studentGroups = [];
  for (let group of Object.values(groups)) {
    if (group.length > 1 && group.length <= maxCapacity) {
      const students = await Student.find({ _id: { $in: group } });
      studentGroups.push(students);
    }
  }

  return studentGroups;
};

module.exports = buildMutualGroups;

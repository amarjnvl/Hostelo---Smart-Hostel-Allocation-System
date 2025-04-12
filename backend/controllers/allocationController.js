const {
  allocateRoomForStudent,
  allocateRoomForGroup,
} = require("../utils/roomAllocator");
const buildMutualGroups = require("../utils/groupGraph");
const Student = require("../models/Student");

const allocateRoomsToGroup = async (collegeId) => {
  try {
    const unallocatedStudents = await Student.find({
      college: collegeId,
      isAllocated: false,
    });

    const mutualGroups = await buildMutualGroups(collegeId);
    const groupedStudentIds = mutualGroups.flat().map((s) => s._id.toString());

    const ungroupedStudents = unallocatedStudents.filter(
      (s) => !groupedStudentIds.includes(s._id.toString())
    );

    for (let group of mutualGroups) {
      for (let student of group) {
        if (student.isAllocated) {
          throw new Error(`${student.name} is already allocated to a room`);
        }
      }
      await allocateRoomForGroup(group);
    }

    for (let student of ungroupedStudents) {
      if (student.isAllocated) {
        throw new Error(`${student.name} is already allocated to a room`);
      }
      await allocateRoomForStudent(student);
    }

    return { success: true };
  } catch (err) {
    console.error("Final Allocation Error:", err);
    throw new Error("Final Room Allocation failed");
  }
};
module.exports = {
  allocateRoomsToGroup,
};

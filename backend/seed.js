const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const db = require("./config/db");
db();

const College = require("./models/College");
const Hostel = require("./models/Hostel");
const Room = require("./models/Room");
const Student = require("./models/Student");

const seed = async () => {
  try {
    console.log("🧹 Clearing old data...");
    await College.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Student.deleteMany();

    // 1. Create a College
    console.log("🏫 Creating College...");
    const college = await College.create({
      name: "National Institute of Technology, Trichy",
      code: "NITT",
      domain: "nitt.edu",
    });

    // 2. Create Hostels (NITT Specific)
    console.log("buildings Creating Hostels...");
    const hostelData = [
      // Year 1 Hostels
      { name: "Garnet A", gender: "male", allowedYears: [1], totalRooms: 50, roomCapacity: 2 },
      { name: "Garnet B", gender: "male", allowedYears: [1], totalRooms: 50, roomCapacity: 2 },
      { name: "Agate", gender: "male", allowedYears: [1], totalRooms: 40, roomCapacity: 3 },
      { name: "Opal A", gender: "female", allowedYears: [1], totalRooms: 30, roomCapacity: 2 },
      { name: "Opal B", gender: "female", allowedYears: [1], totalRooms: 30, roomCapacity: 2 },

      // Year 2 Hostels
      { name: "Coral", gender: "male", allowedYears: [2], totalRooms: 40, roomCapacity: 2 },
      { name: "Diamond", gender: "male", allowedYears: [2], totalRooms: 40, roomCapacity: 3 },
      { name: "Aquamarine", gender: "male", allowedYears: [2], totalRooms: 40, roomCapacity: 3 },
      { name: "Opal C", gender: "female", allowedYears: [2], totalRooms: 30, roomCapacity: 2 }, // Other block
    ];

    const hostels = [];
    for (const h of hostelData) {
      const hostel = await Hostel.create({ ...h, college: college._id });
      hostels.push(hostel);
    }

    // 3. Create Rooms
    console.log("🛏️ Creating Rooms...");
    const roomPromises = [];
    for (const hostel of hostels) {
      for (let i = 1; i <= hostel.totalRooms; i++) {
        roomPromises.push(
          Room.create({
            hostel: hostel._id,
            roomNumber: `${hostel.name.charAt(0)}-${100 + i}`,
            capacity: hostel.roomCapacity,
            occupants: [],
            isFull: false,
          })
        );
      }
    }
    await Promise.all(roomPromises);

    // 4. Create Students (Strict Year 1 & 2)
    console.log("🎓 Creating Students...");
    const students = [];
    // 20 Year 1 students (15 Male, 5 Female)
    for (let i = 1; i <= 20; i++) {
      students.push({
        name: `Year1 Student ${i}`,
        rollNo: `101${String(i).padStart(3, '0')}`,
        email: `101${String(i).padStart(3, '0')}@example.com`,
        gender: i > 15 ? 'female' : 'male',
        year: 1,
        college: college._id,
      });
    }

    // 20 Year 2 students (15 Male, 5 Female)
    for (let i = 1; i <= 20; i++) {
      students.push({
        name: `Year2 Student ${i}`,
        rollNo: `201${String(i).padStart(3, '0')}`,
        email: `201${String(i).padStart(3, '0')}@example.com`,
        gender: i > 15 ? 'female' : 'male',
        year: 2,
        college: college._id,
      });
    }

    await Student.insertMany(students);

    console.log("✅ Database Seeded Successfully for NITT!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seed();

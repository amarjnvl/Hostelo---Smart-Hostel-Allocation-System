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
    await College.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Student.deleteMany();

    // 1. Create a College
    const college = await College.create({
      name: "National Institute of Technology, Trichy",
      code: "NITT",
      domain: "nitt.edu", // original domain (not used in email, just metadata)
    });

    // 2. Create Hostels
    const hostels = await Hostel.insertMany([
      {
        name: "Garnet A",
        gender: "male",
        college: college._id,
        totalRooms: 4,
        roomCapacity: 3,
      },
      {
        name: "Opal",
        gender: "female",
        college: college._id,
        totalRooms: 3,
        roomCapacity: 3,
      },
      {
        name: "Topaz",
        gender: "male",
        college: college._id,
        totalRooms: 2,
        roomCapacity: 2,
      },
    ]);

    // 3. Create Rooms for each hostel
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

    // 4. Create Dummy Students
    const studentData = [];
    const fakeDomain = "fakecollege.edu";

    for (let i = 0; i < 15; i++) {
      const roll = `20250${String(i).padStart(4, "0")}`;
      studentData.push({
        name: `Student ${i + 1}`,
        rollNo: roll,
        email: `${roll}@${fakeDomain}`,
        // gender: i % 2 === 0 ? "male" : "female",
        gender: "male",
        college: college._id,
        preferredHostel: null,
        isAllocated: false,
        allocation: null,
      });
    }

    await Student.insertMany(studentData);

    console.log("✅ Seed data created successfully with fake email domain!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seed();

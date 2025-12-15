const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    totalRooms: { type: Number, required: true },
    roomCapacity: { type: Number, enum: [1, 2, 3], required: true },
    allowedYears: { type: [Number], required: true },
    isAvailableForAllocation: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hostel", hostelSchema);

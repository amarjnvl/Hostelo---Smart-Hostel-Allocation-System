const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    preferredHostel: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel" },
    isAllocated: { type: Boolean, default: false },
    allocation: { type: mongoose.Schema.Types.ObjectId, ref: "Allocation" },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

studentSchema.index({ rollNo: 1, college: 1 }, { unique: true });

module.exports = mongoose.model("Student", studentSchema);

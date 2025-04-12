const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rollNo: { type: String, required: true },
    email: { type: String, unique: true },
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
    groupId: {
      type: String,
      default: null,
    },
    groupHostelChoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

studentSchema.index({ rollNo: 1, college: 1 }, { unique: true });

studentSchema.pre("save", function (next) {
  if (!this.email) {
    this.email = `${this.rollNo}@nonexistentdomain.com`;
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);

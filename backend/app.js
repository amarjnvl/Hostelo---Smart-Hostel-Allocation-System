const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const roommateRoutes = require("./routes/roommateRoutes");
const allocationRoutes = require("./routes/allocationRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/roommate", roommateRoutes);
app.use("/api/allocation", allocationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

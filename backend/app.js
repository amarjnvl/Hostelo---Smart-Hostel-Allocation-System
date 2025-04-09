const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

// Load env
dotenv.config();

// Connect to DB 
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/roommate", require("./routes/roommateRoutes"));
app.use("/api/allocation", require("./routes/allocationRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

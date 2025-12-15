const Hostel = require("../models/Hostel");
const Student = require("../models/Student");

const checkYearConstraint = async (req, res, next) => {
    try {
        const { hostelId } = req.body;
        const studentId = req.user.id; // Assuming authMiddleware populates this

        if (!hostelId) {
            return res
                .status(400)
                .json({ success: false, message: "Hostel ID is required" });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            return res.status(404).json({ success: false, message: "Hostel not found" });
        }

        if (!hostel.allowedYears.includes(student.year)) {
            return res.status(403).json({
                success: false,
                message: `Year ${student.year} students are not allowed to book ${hostel.name}. Allowed: Year ${hostel.allowedYears.join(", ")}`,
            });
        }

        // Attach to req to avoid re-fetching in controller
        req.targetHostel = hostel;
        req.studentProfile = student;

        next();
    } catch (error) {
        console.error("Year Constraint Check Error:", error);
        res.status(500).json({ success: false, message: "Server error during year check" });
    }
};

module.exports = { checkYearConstraint };

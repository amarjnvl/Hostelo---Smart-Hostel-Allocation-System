const nodemailer = require("nodemailer");
const Student = require("../models/Student");

const sendOtp = async (
  email,
  otp,
  subject = "Your OTP for Hostel Portal Login",
  message = `${otp}`
) => {
  try {
    // Find the student by email to check the last OTP sent time
    const student = await Student.findOne({ email });
    const now = Date.now();

    // If student found, check if OTP was sent within the last 10 minutes
    if (student && student.lastOtpSent) {
      const timeDifference = now - student.lastOtpSent;
      if (timeDifference < 600000) {
        throw new Error(
          `OTP request limit reached. Please try again after ${Math.ceil(
            (600000 - timeDifference) / 60000
          )} minutes.`
        );
      }
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Hostel Office" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(info);

    // Update the student's last OTP sent timestamp in the database
    if (student) {
      student.lastOtpSent = now;
      await student.save();
    }

    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOtp;

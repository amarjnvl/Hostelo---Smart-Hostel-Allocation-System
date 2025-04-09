const mongoose = require("mongoose");
const sendOtp = require("../utils/sendOtp");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email validation
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  otp: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{6}$/.test(v); // Ensure OTP is a 6-digit number
      },
      message: (props) => `${props.value} is not a valid OTP!`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
  try {
    // Inline email template
    const emailContent = `
      <h1>Verification Code</h1>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code will expire in 5 minutes.</p>
    `;

    const mailResponse = await sendOtp(
      email,
      "Verification Email",
      emailContent
    );
    console.log("Email sent successfully: ", mailResponse.response);
  } catch (error) {
    console.error("Error occurred while sending email: ", error.message);
    throw new Error("Failed to send verification email");
  }
}

// Define a pre-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      await sendVerificationEmail(this.email, this.otp);
    } catch (error) {
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

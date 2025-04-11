const nodemailer = require("nodemailer");

const sendOtp = async (
  email,
  otp,
  subject = "Your OTP for Hostel Portal Login",
  message = `${otp}`
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Hostel System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(info);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

module.exports = sendOtp;

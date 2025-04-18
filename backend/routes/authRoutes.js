const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerStudent,
  loginStudent,
} = require("../controllers/authController");

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// router.post("/refresh", async (req, res) => {
//   try {
//     // Get refresh token from cookie
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken) {
//       return res.status(401).json({ message: "Refresh token not found" });
//     }

//     // Verify refresh token and generate new access token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
//     const newAccessToken = generateAccessToken(decoded.id);

//     res.json({ token: newAccessToken });
//   } catch (error) {
//     res.status(401).json({ message: "Invalid refresh token" });
//   }
// });

module.exports = router;

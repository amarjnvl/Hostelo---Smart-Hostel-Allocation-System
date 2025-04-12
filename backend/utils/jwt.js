const jwt = require("jsonwebtoken");
require("dotenv").config();


exports.signInToken = ({ id, role }) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "3h",
  });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

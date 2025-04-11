const Student = require("../models/Student");

const getMe = async (req, res) => {
  const student = await Student.findById(req.user.id).populate("college");
  res.status(200).json(student);
};

module.exports = {
  // other exports...
  getMe,
};

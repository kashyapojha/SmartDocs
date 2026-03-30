// routes/login.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    // generate token
    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
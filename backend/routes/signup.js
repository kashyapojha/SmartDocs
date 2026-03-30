// routes/signup.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ msg: "Signup successful" });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
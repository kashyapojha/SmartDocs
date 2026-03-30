// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production";

// Utility: Generate tokens
const generateTokens = (userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: "7d" });
  return { token, refreshToken };
};

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name || "User",
      email,
      password: hashedPassword,
    });

    await user.save();

    const { token, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const { token, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Refresh Token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    if (user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ error: "Refresh token expired" });
    }

    const { token: newToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

// Logout (invalidate refresh token)
router.post("/logout", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      user.refreshToken = null;
      user.refreshTokenExpiry = null;
      await user.save();
    }

    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user info
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;

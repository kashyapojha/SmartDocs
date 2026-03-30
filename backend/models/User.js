// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  
  // OAuth
  googleId: String,
  githubId: String,
  avatar: String,
  
  // Token Management
  refreshToken: String,
  refreshTokenExpiry: Date,
  
  // User Settings
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    theme: { type: String, default: "light" },
  },
  
  // Analytics
  totalDocuments: { type: Number, default: 0 },
  totalWords: { type: Number, default: 0 },
  
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
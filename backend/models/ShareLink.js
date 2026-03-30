// models/ShareLink.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const shareLinkSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Share Token (unique identifier)
  token: { type: String, unique: true },
  
  // Permissions
  permission: { type: String, enum: ["view", "edit", "comment"], default: "view" },
  
  // Expiry
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  
  // Track Access
  accessCount: { type: Number, default: 0 },
  lastAccessedAt: Date,
  accessedBy: [
    {
      email: String,
      ip: String,
      timestamp: Date,
    }
  ],
  
  // Custom Settings
  requirePassword: { type: Boolean, default: false },
  password: String, // Hash this if using
  passwordProtected: String,
  
  // Tracking
  viewTrackingEnabled: { type: Boolean, default: false },
  
}, { timestamps: true });

// Generate unique token before saving
shareLinkSchema.pre("save", async function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

// Index for fast lookups
// Note: token index is created automatically via unique: true
shareLinkSchema.index({ documentId: 1 });

module.exports = mongoose.model("ShareLink", shareLinkSchema);

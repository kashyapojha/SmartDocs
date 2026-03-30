// models/DocumentVersion.js
const mongoose = require("mongoose");

const documentVersionSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
  
  // Version Content
  content: { type: String, required: true },
  title: String,
  
  // Metadata
  versionNumber: Number,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  authorName: String,
  
  // Change Tracking
  changesSummary: String, // e.g., "Added 150 words", "Fixed grammar"
  changeType: { type: String, enum: ["manual", "auto_save", "restore"], default: "manual" },
  
  // Statistics
  wordCount: Number,
  characterCount: Number,
  
  // Diff (optional, for basic comparison)
  diffSnapshot: String, // Could store a diff summary
  
  // Status
  isCurrentVersion: { type: Boolean, default: false },
  
}, { timestamps: true });

// Index for faster queries
documentVersionSchema.index({ documentId: 1, createdAt: -1 });

module.exports = mongoose.model("DocumentVersion", documentVersionSchema);

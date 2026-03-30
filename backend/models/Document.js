// models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Sharing & Permissions
  sharedWith: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permission: { type: String, enum: ["view", "edit"], default: "view" },
      sharedAt: { type: Date, default: Date.now },
    }
  ],
  
  // Ownership
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Analytics
  wordCount: { type: Number, default: 0 },
  characterCount: { type: Number, default: 0 },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastModified: Date,
  
  // Version Control
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: "DocumentVersion" }],
  currentVersion: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentVersion" },
  
  // Tags & Metadata
  tags: [String],
  description: String,
  
  // Status
  isPublished: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  
  // Collaboration
  activeCollaborators: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      cursorPosition: Number,
      color: String,
      name: String,
    }
  ],
  
}, { timestamps: true });

// Index for search
documentSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("Document", documentSchema);

// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      "document_shared",
      "document_edited",
      "comment_received",
      "permission_changed",
      "document_deleted",
      "collaboration_invite",
      "version_restored",
    ],
    required: true,
  },
  
  // Related Document
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  documentTitle: String,
  
  // Sender/Initiator
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  initiatedByName: String,
  
  // Message Content
  message: { type: String, required: true },
  description: String,
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // Action Data
  actionData: mongoose.Schema.Types.Mixed, // Flexible field for extra context
  
  // Link to take action
  actionUrl: String,
  
  // Email notification
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);

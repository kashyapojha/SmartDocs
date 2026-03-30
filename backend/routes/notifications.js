// routes/notifications.js
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

// Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });
  
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, "secretkey");
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get all notifications for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { unread } = req.query;

    let query = { userId: req.userId };

    if (unread === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("initiatedBy", "name email avatar")
      .populate("documentId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      notifications,
      unreadCount: await Notification.countDocuments({
        userId: req.userId,
        isRead: false,
      }),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put("/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete("/:notificationId", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all notifications
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId });

    res.json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Create notification (when document is shared)
router.post("/share/:docId", authMiddleware, async (req, res) => {
  try {
    const { userId, permission } = req.body;

    const notification = new Notification({
      userId,
      type: "document_shared",
      documentId: req.params.docId,
      initiatedBy: req.userId,
      message: `A document has been shared with you (${permission} access)`,
      actionUrl: `/editor/${req.params.docId}`,
    });

    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

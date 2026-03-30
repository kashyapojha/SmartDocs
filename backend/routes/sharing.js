// routes/sharing.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const ShareLink = require("../models/ShareLink");
const Document = require("../models/Document");

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

// Create a share link
router.post("/:docId/create-link", authMiddleware, async (req, res) => {
  try {
    const { permission = "view", expiresAt } = req.body;
    const { docId } = req.params;

    // Verify ownership
    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.userId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Create share link
    const shareLink = new ShareLink({
      documentId: docId,
      createdBy: req.userId,
      permission,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      token: crypto.randomBytes(32).toString("hex"),
    });

    await shareLink.save();

    res.json({
      success: true,
      shareLinkId: shareLink._id,
      token: shareLink.token,
      shareUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/share/${shareLink.token}`,
      permission: shareLink.permission,
      expiresAt: shareLink.expiresAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all share links for a document
router.get("/:docId/links", authMiddleware, async (req, res) => {
  try {
    const { docId } = req.params;

    // Check authorization
    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.userId.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const shareLinks = await ShareLink.find({ documentId: docId }).populate("createdBy", "name email");

    res.json(shareLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document via share link (no auth needed)
router.get("/link/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const shareLink = await ShareLink.findOne({ token });
    if (!shareLink || !shareLink.isActive) {
      return res.status(404).json({ error: "Invalid or expired share link" });
    }

    // Check expiry
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return res.status(403).json({ error: "Share link expired" });
    }

    // Track access
    shareLink.accessCount += 1;
    shareLink.lastAccessedAt = new Date();
    await shareLink.save();

    // Get document
    const doc = await Document.findById(shareLink.documentId).select("title content");

    res.json({
      document: doc,
      permission: shareLink.permission,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update share link permission
router.put("/link/:shareLinkId", authMiddleware, async (req, res) => {
  try {
    const { shareLinkId } = req.params;
    const { permission } = req.body;

    const shareLink = await ShareLink.findById(shareLinkId);
    if (!shareLink) return res.status(404).json({ error: "Share link not found" });

    if (shareLink.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    shareLink.permission = permission;
    await shareLink.save();

    res.json({ success: true, shareLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke share link
router.delete("/link/:shareLinkId", authMiddleware, async (req, res) => {
  try {
    const { shareLinkId } = req.params;

    const shareLink = await ShareLink.findById(shareLinkId);
    if (!shareLink) return res.status(404).json({ error: "Share link not found" });

    if (shareLink.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    shareLink.isActive = false;
    await shareLink.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

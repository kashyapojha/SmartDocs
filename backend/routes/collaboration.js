// routes/collaboration.js
const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const DocumentVersion = require("../models/DocumentVersion");
const Notification = require("../models/Notification");

// Middleware to verify auth (passed in from server.js)
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

// Save document with auto-versioning
router.post("/:docId/save", authMiddleware, async (req, res) => {
  try {
    const { content, title, changesSummary } = req.body;
    const { docId } = req.params;

    // Update document
    const doc = await Document.findByIdAndUpdate(
      docId,
      {
        content,
        title,
        lastModified: new Date(),
        lastModifiedBy: req.userId,
      },
      { new: true }
    );

    // Auto-create version on significant changes (every 10+ changes or manual save)
    const versionCount = await DocumentVersion.countDocuments({ documentId: docId });
    
    if (!versionCount || versionCount < 50) { // Limit versions
      const newVersion = new DocumentVersion({
        documentId: docId,
        content,
        title,
        versionNumber: versionCount + 1,
        author: req.userId,
        changesSummary: changesSummary || "Auto-saved",
        changeType: changesSummary ? "manual" : "auto_save",
        wordCount: content.trim().split(/\s+/).length,
        characterCount: content.length,
        isCurrentVersion: true,
      });

      // Mark previous as not current
      await DocumentVersion.updateMany(
        { documentId: docId },
        { isCurrentVersion: false }
      );

      await newVersion.save();
      doc.currentVersion = newVersion._id;
      doc.versions.push(newVersion._id);
      await doc.save();
    }

    res.json({ success: true, document: doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get active collaborators
router.get("/:docId/collaborators", authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.docId).populate("activeCollaborators.userId");
    res.json(doc.activeCollaborators || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get document version history
router.get("/:docId/versions", authMiddleware, async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ documentId: req.params.docId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore version
router.post("/:docId/restore/:versionId", authMiddleware, async (req, res) => {
  try {
    const { docId, versionId } = req.params;

    // Get the version to restore
    const versionToRestore = await DocumentVersion.findById(versionId);
    if (!versionToRestore) return res.status(404).json({ error: "Version not found" });

    // Update document
    const doc = await Document.findByIdAndUpdate(
      docId,
      {
        content: versionToRestore.content,
        title: versionToRestore.title,
        lastModified: new Date(),
        lastModifiedBy: req.userId,
      },
      { new: true }
    );

    // Create a new version marking this restoration
    const newVersion = new DocumentVersion({
      documentId: docId,
      content: versionToRestore.content,
      title: versionToRestore.title,
      versionNumber: (await DocumentVersion.countDocuments({ documentId: docId })) + 1,
      author: req.userId,
      changesSummary: `Restored to version from ${versionToRestore.createdAt}`,
      changeType: "restore",
      wordCount: versionToRestore.wordCount,
      characterCount: versionToRestore.characterCount,
      isCurrentVersion: true,
    });

    await DocumentVersion.updateMany(
      { documentId: docId },
      { isCurrentVersion: false }
    );

    await newVersion.save();

    res.json({ success: true, document: doc });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

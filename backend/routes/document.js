const express = require('express');
const router = express.Router();
const DocumentVersion = require('../models/DocumentVersion');
const {
  getAllDocs,
  getDocById,
  createDoc,
  updateDoc,
  deleteDoc
} = require('../controllers/documentController');

// Get all documents
router.get('/', getAllDocs);

// Get a single document by ID
router.get('/:id', getDocById);

// Create a new document
router.post('/', createDoc);

// Update a document by ID
router.put('/:id', updateDoc);

// Delete a document by ID
router.delete('/:id', deleteDoc);

// Search documents by title or content
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Missing query" });

    const docs = await DocumentVersion.find({
      $or: [
        { title: new RegExp(q, "i") },
        { content: new RegExp(q, "i") }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50);

    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
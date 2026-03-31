// ================= IMPORTS =================
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIO = require("socket.io");

// ================= APP SETUP =================
const app = express();
const server = http.createServer(app);

// ================= CORS CONFIG =================
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


app.get("/health", (req, res) => {
  res.status(200).send("OK");
});
// ================= SOCKET.IO =================
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// ================= IMPORT MODELS =================
const User = require("./models/User");
const Document = require("./models/Document");
const DocumentVersion = require("./models/DocumentVersion");
const ShareLink = require("./models/ShareLink");
const Notification = require("./models/Notification");

// ================= IMPORT ROUTES =================
const authRoutes = require("./routes/auth");
const collaborationRoutes = require("./routes/collaboration");
const sharingRoutes = require("./routes/sharing");
const notificationRoutes = require("./routes/notifications");

// ================= MONGODB CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ================= AUTH ROUTES =================

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ msg: "Signup successful" });

  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json(err);
  }
});

// ================= DOCUMENT ROUTES =================

// Save document
app.post("/save-document", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const newDoc = new Document({
      title,
      content,
      userId: req.userId,
    });

    await newDoc.save();

    res.json({ message: "Document saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documents
app.get("/documents", authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.userId });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single document
app.get("/document/:id", authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update document
app.put("/update-document/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content }
    );

    res.json({ message: "Document updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete document
app.delete("/delete-document/:id", authMiddleware, async (req, res) => {
  try {
    await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= USE ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/documents", collaborationRoutes);
app.use("/api/share", sharingRoutes);
app.use("/api/notifications", notificationRoutes);

// ================= SOCKET.IO LOGIC =================
const activeDocuments = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-document", (docId, userId) => {
    socket.join(`doc-${docId}`);

    if (!activeDocuments[docId]) {
      activeDocuments[docId] = {};
    }
    activeDocuments[docId][userId] = socket.id;

    io.to(`doc-${docId}`).emit("user-joined", {
      userId,
      activeUsers: Object.keys(activeDocuments[docId]),
    });
  });

  socket.on("document-change", (docId, userId, content) => {
    io.to(`doc-${docId}`).emit("content-updated", {
      userId,
      content,
      timestamp: new Date(),
    });
  });

  socket.on("cursor-move", (docId, userId, position, color) => {
    io.to(`doc-${docId}`).emit("cursor-updated", {
      userId,
      position,
      color,
    });
  });

  socket.on("leave-document", (docId, userId) => {
    socket.leave(`doc-${docId}`);

    if (activeDocuments[docId]) {
      delete activeDocuments[docId][userId];
    }

    io.to(`doc-${docId}`).emit("user-left", {
      userId,
      activeUsers: Object.keys(activeDocuments[docId] || {}),
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
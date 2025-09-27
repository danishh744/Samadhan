const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/civicReports", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const reportSchema = new mongoose.Schema({
  description: String,
  address: String,
  lat: Number,
  lon: Number,
  photoUrl: String,
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model("Report", reportSchema);

// Multer setup (for photo upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

app.use("/uploads", express.static("uploads"));
app.use("/uploads1", express.static("uploads1"));


const upload = multer({ storage });

// API Route: Submit Report
app.post("/api/report", upload.single("photo"), async (req, res) => {
  try {
    const { description, address, lat, lon } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const report = new Report({ description, address, lat, lon, photoUrl });
    await report.save();

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Route: Get All Reports
app.get("/api/reports", async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

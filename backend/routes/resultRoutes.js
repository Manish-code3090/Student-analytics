import express from "express";
import multer from "multer";
import Result from "../models/Result.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/results?test=<id>
router.get("/", protect, async (req, res) => {
  const filter = {};
  if (req.query.test) filter.test = req.query.test;
  if (req.user.role === "student") filter.studentMembership = req.user.membershipId; // students only see their own
  const results = await Result.find(filter);
  res.json(results);
});

// POST /api/results  -> manual single-entry
router.post("/", protect, requireRole("admin", "teacher"), async (req, res) => {
  const { test, studentMembership, marksObtained, remarks } = req.body;
  const result = await Result.create({ test, studentMembership, marksObtained, remarks });
  res.status(201).json(result);
});

// POST /api/results/csv  -> bulk entry via CSV upload (parsing logic to be added)
router.post("/csv", protect, requireRole("admin", "teacher"), upload.single("file"), async (req, res) => {
  // TODO: parse req.file.buffer with csv-parse, map rows -> Result documents
  res.status(501).json({ message: "TODO: implement CSV bulk result upload" });
});

export default router;

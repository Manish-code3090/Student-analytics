import express from "express";
import Batch from "../models/Batch.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/batches  -> all batches in the caller's active center
router.get("/", protect, async (req, res) => {
  const batches = await Batch.find({ center: req.user.centerId });
  res.json(batches);
});

// POST /api/batches  -> admin/teacher creates a batch in their active center
router.post("/", protect, requireRole("admin", "teacher"), async (req, res) => {
  const batch = await Batch.create({ center: req.user.centerId, name: req.body.name, description: req.body.description });
  res.status(201).json(batch);
});

export default router;

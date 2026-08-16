import express from "express";
import Test from "../models/Test.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/tests?class=<id>
router.get("/", protect, async (req, res) => {
  const filter = { center: req.user.centerId };
  if (req.query.class) filter.class = req.query.class;
  const tests = await Test.find(filter);
  res.json(tests);
});

// POST /api/tests
router.post("/", protect, requireRole("admin", "teacher"), async (req, res) => {
  const { name, class: classId, date, maxMarks } = req.body;
  const test = await Test.create({
    center: req.user.centerId,
    class: classId,
    name,
    date,
    maxMarks,
    createdBy: req.user.membershipId,
  });
  res.status(201).json(test);
});

export default router;
